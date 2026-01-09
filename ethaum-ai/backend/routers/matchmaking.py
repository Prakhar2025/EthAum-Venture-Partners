"""EthAum AI - AI Matchmaking Router with Supabase Database.

This router provides AI-powered buyer-startup matchmaking
using explainable heuristics for enterprise acquisition.
"""

from fastapi import APIRouter, HTTPException
from database import get_db
from services.matchmaking import match_buyers_to_startup

router = APIRouter()


@router.get("/{product_id}")
def get_buyer_matches(product_id: int) -> dict:
    """
    Get AI-recommended enterprise buyers for a startup.
    
    This endpoint demonstrates EXPLAINABLE AI MATCHMAKING:
    - Category-based matching (+40 points)
    - Trust score evaluation (+30 points)
    - Market traction assessment (+30 points)
    """
    db = get_db()
    
    # Get product from database
    result = db.table("products").select("*").eq("id", product_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = result.data[0]
    
    # Get trust score and market traction from database
    trust_score = product.get("trust_score", 75)
    market_traction = product.get("market_traction", 70)
    
    # Run AI matchmaking
    matches = match_buyers_to_startup(
        category=product.get("category", "AI/ML"),
        trust_score=trust_score,
        market_traction=market_traction,
    )
    
    return {
        "startup": {
            "id": product["id"],
            "name": product["name"],
            "category": product.get("category", "AI/ML"),
            "trust_score": trust_score,
        },
        "ai_matchmaking": {
            "algorithm": "Explainable Heuristic Scoring v1.0",
            "factors": [
                "Category alignment (40%)",
                "Trust score threshold (30%)",
                "Market traction signals (30%)",
            ],
        },
        "recommended_buyers": matches,
        "total_matches": len(matches),
    }
