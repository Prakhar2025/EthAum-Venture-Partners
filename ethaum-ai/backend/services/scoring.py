"""EthAum AI - Trust Score Calculation Service.

This module implements an explainable credibility scoring system
for startup discovery. The score is designed to be transparent
and easy to understand for both founders and enterprise buyers.

Dynamically calculates score based on reviews and upvotes from database.
"""

from database import get_db


def calculate_trust_score(
    data_integrity: int,
    market_traction: int,
    user_sentiment: int,
) -> int:
    """
    Calculate the Trust Score for a startup.

    Formula:
        Trust Score = 0.40 × Market Traction
                    + 0.35 × Data Integrity
                    + 0.25 × User Sentiment

    Weight Rationale:
        - Market Traction (40%): Strongest signal of product-market fit
          and reduced risk. Hardest metric to fake.
        - Data Integrity (35%): Establishes legitimacy before judging
          quality. Penalizes shell companies.
        - User Sentiment (25%): Qualitative check on satisfaction.
          Slightly lower weight as it's more subjective.

    Args:
        data_integrity: Score from 0-100 measuring legitimacy signals.
        market_traction: Score from 0-100 measuring growth signals.
        user_sentiment: Score from 0-100 measuring review sentiment.

    Returns:
        Integer trust score clamped between 0 and 100.
    """
    raw_score = (
        0.40 * market_traction
        + 0.35 * data_integrity
        + 0.25 * user_sentiment
    )

    # Clamp between 0 and 100
    clamped_score = max(0, min(100, round(raw_score)))

    return clamped_score


def calculate_dynamic_trust_score(product_id: int) -> dict:
    """
    Calculate trust score dynamically from database data.
    
    Factors:
    - Base score from product data
    - Review sentiment average
    - Upvote count bonus
    - Account age factor
    
    Returns dict with score and breakdown.
    """
    db = get_db()
    
    # Get product base scores
    product_result = db.table("products").select(
        "data_integrity, market_traction, user_sentiment, created_at"
    ).eq("id", product_id).execute()
    
    if not product_result.data:
        return {"score": 70, "breakdown": {}}
    
    product = product_result.data[0]
    
    # Get reviews for this product
    reviews_result = db.table("reviews").select(
        "rating, sentiment_score"
    ).eq("product_id", product_id).execute()
    
    reviews = reviews_result.data or []
    
    # Get upvotes from launches
    launch_result = db.table("launches").select("upvotes").eq("product_id", product_id).execute()
    upvotes = launch_result.data[0]["upvotes"] if launch_result.data else 0
    
    # Calculate dynamic scores
    base_data_integrity = product.get("data_integrity", 70)
    base_market_traction = product.get("market_traction", 70)
    
    # Calculate sentiment from reviews
    if reviews:
        avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
        avg_sentiment = sum(float(r.get("sentiment_score", 0.5)) for r in reviews) / len(reviews)
        # Convert to 0-100 scale
        user_sentiment = int((avg_rating / 5) * 50 + avg_sentiment * 50)
        # Review count bonus (more reviews = more reliable)
        review_bonus = min(10, len(reviews) * 2)
    else:
        user_sentiment = product.get("user_sentiment", 70)
        review_bonus = 0
    
    # Upvote bonus (max 10 points)
    upvote_bonus = min(10, upvotes)
    
    # Adjust market traction based on upvotes
    dynamic_traction = min(100, base_market_traction + upvote_bonus)
    
    # Calculate final score
    final_score = calculate_trust_score(
        data_integrity=base_data_integrity,
        market_traction=dynamic_traction,
        user_sentiment=user_sentiment
    )
    
    # Add bonuses
    final_score = min(100, final_score + review_bonus)
    
    return {
        "score": final_score,
        "breakdown": {
            "data_integrity": base_data_integrity,
            "market_traction": dynamic_traction,
            "user_sentiment": user_sentiment,
            "review_count": len(reviews),
            "upvotes": upvotes,
            "review_bonus": review_bonus,
            "upvote_bonus": upvote_bonus,
        }
    }


def update_product_trust_score(product_id: int) -> int:
    """
    Recalculate and update the trust score for a product.
    Call this after new reviews or upvotes.
    
    Returns the new score.
    """
    db = get_db()
    result = calculate_dynamic_trust_score(product_id)
    
    # Update product in database
    db.table("products").update({
        "trust_score": result["score"],
        "user_sentiment": result["breakdown"].get("user_sentiment", 70),
        "market_traction": result["breakdown"].get("market_traction", 70),
    }).eq("id", product_id).execute()
    
    return result["score"]
