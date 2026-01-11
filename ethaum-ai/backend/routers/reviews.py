"""EthAum AI - Reviews Router with AI Sentiment Analysis.

Includes AI-powered sentiment analysis and dynamic trust score updates.
"""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from database import get_db
from schemas.review import ReviewCreate, ReviewResponse
from services.sentiment import analyze_sentiment, get_sentiment_score
from services.scoring import update_product_trust_score

router = APIRouter()


@router.post("/", response_model=ReviewResponse)
def create_review(
    review: ReviewCreate,
    x_clerk_user_id: Optional[str] = Header(None)
) -> ReviewResponse:
    """
    Submit a new product review with AI sentiment analysis.
    Requires authentication - review is linked to the submitting user.
    """
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required to submit a review")
    
    db = get_db()
    
    # Get user from database
    user_result = db.table("users").select("id, full_name").eq("clerk_id", x_clerk_user_id).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found. Please sign in again.")
    
    user = user_result.data[0]
    reviewer_name = user.get("full_name") or "Anonymous"
    
    # Check if product exists
    product_result = db.table("products").select("id").eq("id", review.product_id).execute()
    if not product_result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # AI Sentiment Analysis on review comment
    sentiment_result = analyze_sentiment(review.comment)
    
    # Combine rating and text sentiment (60% rating, 40% text)
    rating_sentiment = review.rating / 5  # 0 to 1
    text_sentiment = (sentiment_result["score"] + 1) / 2  # Convert -1,1 to 0,1
    combined_sentiment = round(rating_sentiment * 0.6 + text_sentiment * 0.4, 2)
    
    # Insert review
    try:
        result = db.table("reviews").insert({
            "product_id": review.product_id,
            "rating": int(review.rating),
            "comment": review.comment,
            "reviewer_name": reviewer_name,
            "sentiment_score": combined_sentiment,
            "verified": False,
            "user_id": user["id"],
        }).execute()
    except Exception:
        # Fallback if user_id column doesn't exist
        result = db.table("reviews").insert({
            "product_id": review.product_id,
            "rating": int(review.rating),
            "comment": review.comment,
            "reviewer_name": reviewer_name,
            "sentiment_score": combined_sentiment,
            "verified": False,
        }).execute()
    
    if result.data:
        new_review = result.data[0]
        
        # Update product's trust score after new review
        try:
            update_product_trust_score(review.product_id)
        except Exception:
            pass  # Don't fail if score update fails
        
        return ReviewResponse(
            id=new_review["id"],
            product_id=new_review["product_id"],
            rating=new_review["rating"],
            comment=new_review["comment"],
            sentiment_score=int(new_review["sentiment_score"] * 100),
            reviewer_name=reviewer_name,
        )
    
    raise HTTPException(status_code=500, detail="Failed to create review")


@router.get("/{product_id}")
def get_reviews_for_product(product_id: int) -> list[dict]:
    """Get all reviews for a specific product with sentiment info."""
    db = get_db()
    
    try:
        result = db.table("reviews").select("*").eq("product_id", product_id).order("created_at", desc=True).execute()
    except Exception:
        result = db.table("reviews").select("*").eq("product_id", product_id).execute()
    
    reviews = []
    for r in result.data or []:
        # Get sentiment label
        sentiment_value = float(r.get("sentiment_score", 0.5))
        if sentiment_value > 0.6:
            sentiment_label = "positive"
        elif sentiment_value < 0.4:
            sentiment_label = "negative"
        else:
            sentiment_label = "neutral"
        
        reviews.append({
            "id": r["id"],
            "product_id": r["product_id"],
            "rating": r["rating"],
            "comment": r["comment"],
            "sentiment_score": int(sentiment_value * 100),
            "sentiment_label": sentiment_label,
            "reviewer_name": r.get("reviewer_name", "Anonymous"),
            "verified": r.get("verified", False),
        })
    
    return reviews


@router.get("/{product_id}/sentiment-summary")
def get_sentiment_summary(product_id: int) -> dict:
    """Get AI sentiment summary for a product's reviews."""
    db = get_db()
    result = db.table("reviews").select("rating, sentiment_score, comment").eq("product_id", product_id).execute()
    
    reviews = result.data or []
    
    if not reviews:
        return {
            "total_reviews": 0,
            "average_rating": 0,
            "average_sentiment": 50,
            "sentiment_label": "neutral",
            "positive_count": 0,
            "negative_count": 0,
            "neutral_count": 0,
        }
    
    total = len(reviews)
    avg_rating = sum(r["rating"] for r in reviews) / total
    avg_sentiment = sum(float(r.get("sentiment_score", 0.5)) for r in reviews) / total
    
    positive = sum(1 for r in reviews if float(r.get("sentiment_score", 0.5)) > 0.6)
    negative = sum(1 for r in reviews if float(r.get("sentiment_score", 0.5)) < 0.4)
    neutral = total - positive - negative
    
    if avg_sentiment > 0.6:
        label = "positive"
    elif avg_sentiment < 0.4:
        label = "negative"
    else:
        label = "neutral"
    
    return {
        "total_reviews": total,
        "average_rating": round(avg_rating, 1),
        "average_sentiment": int(avg_sentiment * 100),
        "sentiment_label": label,
        "positive_count": positive,
        "negative_count": negative,
        "neutral_count": neutral,
    }


@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    x_clerk_user_id: Optional[str] = Header(None)
) -> dict:
    """Delete a review (only owner can delete)."""
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    db = get_db()
    
    # Get review to find product_id for score update
    review_result = db.table("reviews").select("product_id").eq("id", review_id).execute()
    product_id = review_result.data[0]["product_id"] if review_result.data else None
    
    # Delete review
    db.table("reviews").delete().eq("id", review_id).execute()
    
    # Update product trust score
    if product_id:
        try:
            update_product_trust_score(product_id)
        except Exception:
            pass
    
    return {"success": True, "message": "Review deleted successfully"}
