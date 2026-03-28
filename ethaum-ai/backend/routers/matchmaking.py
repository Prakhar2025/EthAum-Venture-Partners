"""EthAum AI — AI Matchmaking Router (Phase 7 Upgrade).

Phase 7: Passes compliance and geography from Phase 2 V2 product fields
into the upgraded scoring model.
"""

from fastapi import APIRouter, HTTPException
from database import get_db
from services.matchmaking import match_buyers_to_startup

router = APIRouter()


@router.get("/{product_id}")
def get_buyer_matches(product_id: int) -> dict:
    """
    Get AI-recommended enterprise buyers for a startup.

    Phase 7 scoring model (4 factors, sum to 100):
        - Healthcare category alignment (40%)
        - Compliance certification overlap  (30%)
        - Geographic market overlap         (20%)
        - Trust Score credibility           (10%)
    """
    db = get_db()

    result = db.table("products").select("*").eq("id", product_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Product not found")

    product = result.data[0]

    trust_score     = product.get("trust_score", 75)
    market_traction = product.get("market_traction", 70)

    # Phase 7: use healthcare_category + V2 compliance/geography arrays
    healthcare_cat = product.get("healthcare_category") or product.get("category", "")
    compliance     = product.get("compliance") or []
    geography      = product.get("geography") or []

    matches = match_buyers_to_startup(
        category=healthcare_cat,
        trust_score=trust_score,
        market_traction=market_traction,
        compliance=compliance,
        geography=geography,
    )

    return {
        "startup": {
            "id":                  product["id"],
            "name":                product["name"],
            "category":            healthcare_cat,
            "trust_score":         trust_score,
            "compliance":          compliance,
            "geography":           geography,
        },
        "ai_matchmaking": {
            "algorithm": "Phase 7 Weighted Healthcare Scoring v2.0",
            "factors": [
                "Healthcare category alignment (40%)",
                "Compliance certification overlap (30%)",
                "Geographic market overlap (20%)",
                "Trust score credibility (10%)",
            ],
        },
        "recommended_buyers": matches,
        "total_matches":      len(matches),
    }
