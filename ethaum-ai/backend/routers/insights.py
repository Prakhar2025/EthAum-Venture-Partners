"""EthAum AI - Insights Router (Gartner-Inspired)."""

from fastapi import APIRouter, HTTPException

from services.credibility import (
    calculate_overall_credibility_score,
    calculate_emerging_quadrant_position,
)

router = APIRouter()


@router.get("/{product_id}/credibility")
def get_overall_credibility(product_id: int) -> dict:
    """
    Get comprehensive credibility score combining all platform signals.
    
    This is the CORE DIFFERENTIATOR - unifying Product Hunt + G2 + Gartner.
    """
    # Import data from other routers (in production, use shared data layer)
    from routers.launches import LAUNCHES
    from routers.products import DUMMY_PRODUCTS
    from routers.reviews import REVIEWS
    
    # Find product
    product = next((p for p in DUMMY_PRODUCTS if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Gather signals from all sources
    product_launches = [l for l in LAUNCHES if l["product_id"] == product_id]
    total_upvotes = sum(l["upvotes"] for l in product_launches)
    
    product_reviews = [r for r in REVIEWS if r["product_id"] == product_id]
    review_count = len(product_reviews)
    average_rating = (
        sum(r["rating"] for r in product_reviews) / review_count
        if review_count > 0
        else 0.0
    )
    
    trust_score = product.get("trust_score", 75)
    
    # Calculate overall credibility score
    credibility_data = calculate_overall_credibility_score(
        upvotes=total_upvotes,
        review_count=review_count,
        average_rating=average_rating,
        trust_score=trust_score,
        funding_stage=product.get("funding_stage", "Series A"),
    )
    
    # Add product context
    credibility_data["product"] = {
        "id": product["id"],
        "name": product["name"],
        "category": product["category"],
        "funding_stage": product["funding_stage"],
    }
    
    # Add raw metrics
    credibility_data["raw_metrics"] = {
        "total_upvotes": total_upvotes,
        "review_count": review_count,
        "average_rating": round(average_rating, 2),
    }
    
    return credibility_data


@router.get("/quadrant")
def get_emerging_quadrant() -> dict:
    """
    Gartner-style Emerging Quadrant view of all Series A-D startups.
    
    Returns all products positioned by credibility vs traction.
    """
    from routers.launches import LAUNCHES
    from routers.products import DUMMY_PRODUCTS
    from routers.reviews import REVIEWS
    
    quadrant_data = []
    
    for product in DUMMY_PRODUCTS:
        product_id = product["id"]
        
        # Calculate overall credibility
        product_launches = [l for l in LAUNCHES if l["product_id"] == product_id]
        total_upvotes = sum(l["upvotes"] for l in product_launches)
        
        product_reviews = [r for r in REVIEWS if r["product_id"] == product_id]
        review_count = len(product_reviews)
        average_rating = (
            sum(r["rating"] for r in product_reviews) / review_count
            if review_count > 0
            else 0.0
        )
        
        trust_score = product.get("trust_score", 75)
        
        credibility_result = calculate_overall_credibility_score(
            upvotes=total_upvotes,
            review_count=review_count,
            average_rating=average_rating,
            trust_score=trust_score,
        )
        
        overall_score = credibility_result["overall_credibility_score"]
        
        # Use trust score's market traction component as traction score
        market_traction_score = credibility_result["breakdown"]["trust_score"]
        
        # Position in quadrant
        position = calculate_emerging_quadrant_position(
            overall_credibility_score=overall_score,
            market_traction_score=market_traction_score,
        )
        
        quadrant_data.append({
            "product": {
                "id": product["id"],
                "name": product["name"],
                "category": product["category"],
            },
            "overall_credibility_score": overall_score,
            "badge": credibility_result["badge"],
            "quadrant": position["quadrant"],
            "coordinates": position["coordinates"],
        })
    
    return {
        "title": "Emerging Leaders Quadrant - Series A-D SaaS Startups",
        "description": "AI-generated positioning based on credibility and traction signals",
        "products": quadrant_data,
        "quadrants": {
            "Leaders": "High credibility + High traction (Enterprise Ready)",
            "Challengers": "High credibility + Growing traction (Promising)",
            "Visionaries": "High growth + Building credibility (High Potential)",
            "Niche Players": "Early stage in both dimensions",
        },
    }


@router.get("/{product_id}/badge")
def get_embeddable_badge(product_id: int) -> dict:
    """
    Get embeddable badge data for startup websites.
    
    Startups can embed this on their site to show credibility.
    """
    from routers.launches import LAUNCHES
    from routers.products import DUMMY_PRODUCTS
    from routers.reviews import REVIEWS
    
    # Find product
    product = next((p for p in DUMMY_PRODUCTS if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Calculate credibility
    product_launches = [l for l in LAUNCHES if l["product_id"] == product_id]
    total_upvotes = sum(l["upvotes"] for l in product_launches)
    
    product_reviews = [r for r in REVIEWS if r["product_id"] == product_id]
    review_count = len(product_reviews)
    average_rating = (
        sum(r["rating"] for r in product_reviews) / review_count
        if review_count > 0
        else 0.0
    )
    
    trust_score = product.get("trust_score", 75)
    
    credibility_data = calculate_overall_credibility_score(
        upvotes=total_upvotes,
        review_count=review_count,
        average_rating=average_rating,
        trust_score=trust_score,
    )
    
    return {
        "product_name": product["name"],
        "score": credibility_data["overall_credibility_score"],
        "badge": credibility_data["badge"],
        "embed_code": f'<div data-ethaum-badge="{product_id}"></div>',
        "svg_url": f"https://ethaum.ai/badges/{product_id}.svg",
        "verified_by": "EthAum.AI",
    }
