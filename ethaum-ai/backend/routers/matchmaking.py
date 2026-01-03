"""EthAum AI - AI Matchmaking Router.

This router provides AI-powered buyer-startup matchmaking
using explainable heuristics for enterprise acquisition.

NOTE: This is an explainable AI heuristic for MVP demonstration.
"""

from fastapi import APIRouter, HTTPException

from services.matchmaking import match_buyers_to_startup
from routers.products import DUMMY_PRODUCTS

router = APIRouter()


@router.get("/{product_id}")
def get_buyer_matches(product_id: int) -> dict:
    """
    Get AI-recommended enterprise buyers for a startup.
    
    This endpoint demonstrates EXPLAINABLE AI MATCHMAKING:
    - Category-based matching (+40 points)
    - Trust score evaluation (+30 points)
    - Market traction assessment (+30 points)
    
    The algorithm provides transparent reasoning for each match,
    enabling startups to understand why certain buyers are recommended.
    """
    # Find the product
    product = next((p for p in DUMMY_PRODUCTS if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get trust score and calculate market traction
    trust_score = product.get("trust_score", 75)
    
    # Simulate market traction from trust score components
    # In production, this would come from actual metrics
    market_traction = min(100, trust_score - 10 + (product_id * 5))
    
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
