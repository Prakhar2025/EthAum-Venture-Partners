"""EthAum AI - Comparisons Router (G2-Inspired).

This router provides enterprise-focused startup comparisons
with ROI metrics and integration capabilities.

NOTE: This is MVP/Demo mode with in-memory data.
"""

from fastapi import APIRouter, HTTPException

router = APIRouter()

# Comparison metrics data (demo mode)
COMPARISON_METRICS = {
    1: {  # NeuraTech
        "name": "NeuraTech",
        "category": "AI/ML",
        "trust_score": 92,
        "pricing_tier": "Enterprise",
        "avg_implementation_days": 14,
        "roi_percentage": 340,
        "integration_count": 45,
        "support_sla": "24/7 Priority",
        "security_certifications": ["SOC2", "GDPR", "ISO27001"],
        "key_features": ["Real-time Analytics", "Custom ML Models", "API-first"],
        "ideal_for": "Large enterprises needing custom AI solutions",
    },
    2: {  # CloudSync
        "name": "CloudSync",
        "category": "DevOps",
        "trust_score": 87,
        "pricing_tier": "Growth",
        "avg_implementation_days": 7,
        "roi_percentage": 280,
        "integration_count": 62,
        "support_sla": "Business Hours",
        "security_certifications": ["SOC2", "GDPR"],
        "key_features": ["CI/CD Automation", "Multi-cloud", "GitOps"],
        "ideal_for": "Tech teams modernizing DevOps workflows",
    },
    3: {  # FinLedger
        "name": "FinLedger",
        "category": "FinTech",
        "trust_score": 78,
        "pricing_tier": "Enterprise",
        "avg_implementation_days": 30,
        "roi_percentage": 420,
        "integration_count": 28,
        "support_sla": "24/7 Priority",
        "security_certifications": ["SOC2", "PCI-DSS", "GDPR", "ISO27001"],
        "key_features": ["Blockchain Audit", "Real-time Compliance", "Smart Contracts"],
        "ideal_for": "Financial institutions requiring compliance automation",
    },
}


@router.get("/")
def get_all_comparisons() -> dict:
    """
    Get all startups available for comparison.
    """
    startups = [
        {
            "id": pid,
            "name": data["name"],
            "category": data["category"],
            "trust_score": data["trust_score"],
        }
        for pid, data in COMPARISON_METRICS.items()
    ]
    return {"startups": startups}


@router.get("/{product_id_1}/vs/{product_id_2}")
def compare_startups(product_id_1: int, product_id_2: int) -> dict:
    """
    Compare two startups side-by-side with enterprise metrics.
    
    G2-Inspired comparison including:
    - ROI metrics
    - Integration capabilities
    - Security certifications
    - Implementation time
    """
    if product_id_1 not in COMPARISON_METRICS:
        raise HTTPException(status_code=404, detail=f"Product {product_id_1} not found")
    if product_id_2 not in COMPARISON_METRICS:
        raise HTTPException(status_code=404, detail=f"Product {product_id_2} not found")
    
    startup_1 = COMPARISON_METRICS[product_id_1]
    startup_2 = COMPARISON_METRICS[product_id_2]
    
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
