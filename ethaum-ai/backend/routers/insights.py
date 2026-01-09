"""EthAum AI - Insights Router with Supabase Database (Gartner-Inspired)."""

from fastapi import APIRouter, HTTPException
from database import get_db
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
    db = get_db()
    
    # Get product
    product_result = db.table("products").select("*").eq("id", product_id).execute()
    if not product_result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = product_result.data[0]
    
    # Get launches
    launches_result = db.table("launches").select("upvotes").eq("product_id", product_id).execute()
    total_upvotes = sum(l.get("upvotes", 0) for l in launches_result.data or [])
    
    # Get reviews
    reviews_result = db.table("reviews").select("rating").eq("product_id", product_id).execute()
    reviews = reviews_result.data or []
    review_count = len(reviews)
    average_rating = sum(r.get("rating", 0) for r in reviews) / review_count if review_count > 0 else 0.0
    
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
        "category": product.get("category", ""),
        "funding_stage": product.get("funding_stage", ""),
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
    """
    db = get_db()
    
    # Get all products
    products_result = db.table("products").select("*").execute()
    
    quadrant_data = []
    
    for product in products_result.data or []:
        product_id = product["id"]
        
        # Get launches
        launches_result = db.table("launches").select("upvotes").eq("product_id", product_id).execute()
        total_upvotes = sum(l.get("upvotes", 0) for l in launches_result.data or [])
        
        # Get reviews
        reviews_result = db.table("reviews").select("rating").eq("product_id", product_id).execute()
        reviews = reviews_result.data or []
        review_count = len(reviews)
        average_rating = sum(r.get("rating", 0) for r in reviews) / review_count if review_count > 0 else 0.0
        
        trust_score = product.get("trust_score", 75)
        
        credibility_result = calculate_overall_credibility_score(
            upvotes=total_upvotes,
            review_count=review_count,
            average_rating=average_rating,
            trust_score=trust_score,
        )
        
        overall_score = credibility_result["overall_credibility_score"]
        market_traction_score = credibility_result["breakdown"]["trust_score"]
        
        position = calculate_emerging_quadrant_position(
            overall_credibility_score=overall_score,
            market_traction_score=market_traction_score,
        )
        
        quadrant_data.append({
            "product": {
                "id": product["id"],
                "name": product["name"],
                "category": product.get("category", ""),
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
    """
    db = get_db()
    
    # Get product
    product_result = db.table("products").select("*").eq("id", product_id).execute()
    if not product_result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = product_result.data[0]
    
    # Get launches
    launches_result = db.table("launches").select("upvotes").eq("product_id", product_id).execute()
    total_upvotes = sum(l.get("upvotes", 0) for l in launches_result.data or [])
    
    # Get reviews
    reviews_result = db.table("reviews").select("rating").eq("product_id", product_id).execute()
    reviews = reviews_result.data or []
    review_count = len(reviews)
    average_rating = sum(r.get("rating", 0) for r in reviews) / review_count if review_count > 0 else 0.0
    
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
