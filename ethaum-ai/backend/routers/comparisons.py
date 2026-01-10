"""EthAum AI - Comparisons Router (G2-Inspired).

This router provides enterprise-focused startup comparisons
with ROI metrics and integration capabilities.
Now fetches from database!
"""

from fastapi import APIRouter, HTTPException
from database import get_db

router = APIRouter()


@router.get("/")
def get_all_comparisons() -> dict:
    """
    Get all startups available for comparison from database.
    """
    db = get_db()
    result = db.table("products").select("id, name, category, trust_score").execute()
    
    startups = [
        {
            "id": product["id"],
            "name": product["name"],
            "category": product["category"],
            "trust_score": product["trust_score"],
        }
        for product in (result.data or [])
    ]
    return {"startups": startups}


@router.get("/{product_id_1}/vs/{product_id_2}")
def compare_startups(product_id_1: int, product_id_2: int) -> dict:
    """
    Compare two startups side-by-side with enterprise metrics.
    """
    db = get_db()
    
    # Get both products from database
    result_1 = db.table("products").select("*").eq("id", product_id_1).execute()
    result_2 = db.table("products").select("*").eq("id", product_id_2).execute()
    
    if not result_1.data:
        raise HTTPException(status_code=404, detail=f"Product {product_id_1} not found")
    if not result_2.data:
        raise HTTPException(status_code=404, detail=f"Product {product_id_2} not found")
    
    p1 = result_1.data[0]
    p2 = result_2.data[0]
    
    # Generate comparison metrics (simulated for MVP)
    startup_1 = {
        "name": p1["name"],
        "category": p1["category"],
        "trust_score": p1["trust_score"],
        "pricing_tier": "Enterprise",
        "avg_implementation_days": 14,
        "roi_percentage": 280 + (p1["trust_score"] * 2),
        "integration_count": 30 + p1["market_traction"],
        "support_sla": "24/7 Priority",
        "security_certifications": ["SOC2", "GDPR"],
        "key_features": ["Custom Solutions", "API-first", "Real-time"],
        "ideal_for": f"Enterprises in {p1['category']} looking for trusted solutions",
    }
    
    startup_2 = {
        "name": p2["name"],
        "category": p2["category"],
        "trust_score": p2["trust_score"],
        "pricing_tier": "Enterprise",
        "avg_implementation_days": 14,
        "roi_percentage": 280 + (p2["trust_score"] * 2),
        "integration_count": 30 + p2["market_traction"],
        "support_sla": "24/7 Priority",
        "security_certifications": ["SOC2", "GDPR"],
        "key_features": ["Custom Solutions", "API-first", "Real-time"],
        "ideal_for": f"Enterprises in {p2['category']} looking for trusted solutions",
    }
    
    # Calculate winner for each metric
    comparison_results = {
        "trust_score": {
            "winner": startup_1["name"] if startup_1["trust_score"] > startup_2["trust_score"] else startup_2["name"],
            "values": {startup_1["name"]: startup_1["trust_score"], startup_2["name"]: startup_2["trust_score"]},
        },
        "roi_percentage": {
            "winner": startup_1["name"] if startup_1["roi_percentage"] > startup_2["roi_percentage"] else startup_2["name"],
            "values": {startup_1["name"]: startup_1["roi_percentage"], startup_2["name"]: startup_2["roi_percentage"]},
        },
        "implementation_speed": {
            "winner": startup_1["name"] if startup_1["avg_implementation_days"] < startup_2["avg_implementation_days"] else startup_2["name"],
            "values": {startup_1["name"]: startup_1["avg_implementation_days"], startup_2["name"]: startup_2["avg_implementation_days"]},
            "unit": "days",
        },
        "integrations": {
            "winner": startup_1["name"] if startup_1["integration_count"] > startup_2["integration_count"] else startup_2["name"],
            "values": {startup_1["name"]: startup_1["integration_count"], startup_2["name"]: startup_2["integration_count"]},
        },
    }
    
    return {
        "comparison": {
            "startup_1": {**startup_1, "id": product_id_1},
            "startup_2": {**startup_2, "id": product_id_2},
        },
        "metrics_comparison": comparison_results,
        "recommendation": _generate_recommendation(startup_1, startup_2),
    }


def _generate_recommendation(s1: dict, s2: dict) -> str:
    """Generate AI recommendation based on comparison."""
    score_1 = s1["trust_score"] + (s1["roi_percentage"] / 10) + s1["integration_count"]
    score_2 = s2["trust_score"] + (s2["roi_percentage"] / 10) + s2["integration_count"]
    
    if score_1 > score_2:
        return f"{s1['name']} is recommended for enterprises prioritizing ROI and credibility."
    else:
        return f"{s2['name']} is recommended for enterprises prioritizing ROI and credibility."
