"""EthAum AI - AI Matchmaking Service.

This module provides EXPLAINABLE AI HEURISTICS for matching
enterprise buyers to startups based on category, trust score,
and market traction.

NOTE: This is an explainable AI heuristic for MVP demonstration.
In production, this would use ML models trained on buyer behavior.
"""

# Buyer personas for AI matchmaking
BUYER_PERSONAS = [
    {
        "id": 1,
        "buyer_type": "Enterprise Fintech",
        "categories": ["AI/ML", "FinTech", "Security"],
        "min_trust_score": 75,
        "description": "Large financial institutions seeking AI-powered solutions",
    },
    {
        "id": 2,
        "buyer_type": "Tech Enterprise",
        "categories": ["DevOps", "AI/ML", "Cloud"],
        "min_trust_score": 70,
        "description": "Technology companies modernizing their infrastructure",
    },
    {
        "id": 3,
        "buyer_type": "Retail Chain",
        "categories": ["AI/ML", "Analytics", "E-commerce"],
        "min_trust_score": 65,
        "description": "Retail enterprises optimizing operations with AI",
    },
    {
        "id": 4,
        "buyer_type": "Healthcare Provider",
        "categories": ["AI/ML", "HealthTech", "Security"],
        "min_trust_score": 80,
        "description": "Healthcare organizations with strict compliance needs",
    },
    {
        "id": 5,
        "buyer_type": "Manufacturing Corp",
        "categories": ["IoT", "AI/ML", "Analytics"],
        "min_trust_score": 60,
        "description": "Industrial enterprises adopting Industry 4.0",
    },
]


def match_buyers_to_startup(
    category: str,
    trust_score: int,
    market_traction: int,
) -> list[dict]:
    """
    AI-powered matching of enterprise buyers to startups.
    
    This uses EXPLAINABLE HEURISTICS (not ML training) for MVP demonstration.
    
    Scoring Logic:
    - Category match: +40 points
    - Trust score > 80: +30 points
    - Trust score > 60: +15 points
    - High market traction (>60): +30 points
    - Medium market traction (>40): +15 points
    
    Args:
        category: Startup's primary category
        trust_score: AI-generated trust score (0-100)
        market_traction: Market traction score from signals (0-100)
    
    Returns:
        List of matched buyer personas with scores and reasons
    """
    matches = []
    
    for buyer in BUYER_PERSONAS:
        match_score = 0
        reasons = []
        
        # Category matching (+40 max)
        if category in buyer["categories"]:
            match_score += 40
            reasons.append(f"Strong category fit: {category}")
        elif any(cat in category for cat in buyer["categories"]):
            match_score += 20
            reasons.append(f"Partial category alignment")
        
        # Trust score evaluation (+30 max)
        if trust_score >= buyer["min_trust_score"]:
            if trust_score >= 80:
                match_score += 30
                reasons.append(f"High credibility (Trust Score: {trust_score})")
            elif trust_score >= 60:
                match_score += 15
                reasons.append(f"Good credibility (Trust Score: {trust_score})")
        else:
            # Below minimum threshold
            match_score -= 20
            reasons.append(f"Below trust threshold")
        
        # Market traction evaluation (+30 max)
        if market_traction >= 60:
            match_score += 30
            reasons.append("Strong market traction signals")
        elif market_traction >= 40:
            match_score += 15
            reasons.append("Growing market presence")
        
        # Only include matches above 30%
        if match_score >= 30:
            matches.append({
                "buyer_type": buyer["buyer_type"],
                "buyer_description": buyer["description"],
                "match_score": min(100, max(0, match_score)),
                "reasons": reasons,
                "recommendation": _get_recommendation(match_score),
            })
    
    # Sort by match score descending
    matches.sort(key=lambda x: x["match_score"], reverse=True)
    
    return matches[:5]  # Return top 5 matches


def _get_recommendation(score: int) -> str:
    """Generate recommendation text based on match score."""
    if score >= 80:
        return "Highly Recommended - Ideal enterprise fit"
    elif score >= 60:
        return "Recommended - Strong alignment potential"
    elif score >= 40:
        return "Consider - Worth exploring"
    else:
        return "Low Match - May require nurturing"
