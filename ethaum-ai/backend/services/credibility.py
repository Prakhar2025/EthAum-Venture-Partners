"""EthAum AI - Overall Credibility Scoring Service.

This module calculates a comprehensive credibility score by combining:
- Product Hunt signals (upvotes, launch momentum)
- G2 signals (reviews, ratings)
- Gartner signals (trust score from data integrity, traction, sentiment)

This is the CORE DIFFERENTIATOR of EthAum.AI - a unified credibility metric
for Series A-D startups.
"""

from typing import Optional


def calculate_overall_credibility_score(
    upvotes: int,
    review_count: int,
    average_rating: float,
    trust_score: int,
    funding_stage: str = "Series A",
) -> dict:
    """
    Calculate overall credibility score combining all platform signals.
    
    Formula:
        Overall Score = 0.30 × Launch Signal (upvotes)
                      + 0.30 × Review Signal (G2-style)
                      + 0.40 × Trust Score (Gartner-style)
    
    Weight Rationale:
        - Trust Score (40%): Core legitimacy and traction data
        - Launch Signal (30%): Community validation and buzz
        - Review Signal (30%): User satisfaction and testimonials
    
    This creates a unified view across Product Hunt + G2 + Gartner capabilities.
    
    Args:
        upvotes: Number of upvotes from launches (Product Hunt signal)
        review_count: Number of reviews submitted (G2 signal)
        average_rating: Average star rating from reviews (1-5)
        trust_score: AI Trust Score (0-100) from data/traction/sentiment
        funding_stage: Startup funding stage for context
    
    Returns:
        Dictionary containing overall score, breakdown, and badge tier
    """
    # Normalize launch signal (upvotes) to 0-100 scale
    # Assumes 100+ upvotes = excellent for Series A-D startups
    launch_signal = min(100, (upvotes / 100) * 100)
    
    # Normalize review signal to 0-100 scale
    # Combines review volume + quality
    review_volume_score = min(100, (review_count / 20) * 100)  # 20+ reviews = max
    review_quality_score = (average_rating / 5.0) * 100  # 5-star rating normalized
    review_signal = (review_volume_score * 0.4) + (review_quality_score * 0.6)
    
    # Calculate weighted overall score
    overall_score = (
        0.30 * launch_signal +
        0.30 * review_signal +
        0.40 * trust_score
    )
    
    overall_score = round(min(100, max(0, overall_score)))
    
    # Determine badge tier
    badge = _get_badge_tier(overall_score)
    
    # Generate credibility insights
    insights = _generate_insights(
        overall_score, launch_signal, review_signal, trust_score, upvotes, review_count
    )
    
    return {
        "overall_credibility_score": overall_score,
        "badge": badge,
        "breakdown": {
            "launch_signal": round(launch_signal, 1),
            "review_signal": round(review_signal, 1),
            "trust_score": trust_score,
        },
        "weights": {
            "launch_signal": "30%",
            "review_signal": "30%",
            "trust_score": "40%",
        },
        "insights": insights,
        "funding_stage": funding_stage,
    }


def _get_badge_tier(score: int) -> dict:
    """Determine embeddable badge tier based on overall score."""
    if score >= 90:
        return {"tier": "Elite", "color": "#FFD700", "icon": "🏆"}
    elif score >= 80:
        return {"tier": "Verified Leader", "color": "#4CAF50", "icon": "✅"}
    elif score >= 70:
        return {"tier": "Rising Star", "color": "#2196F3", "icon": "⭐"}
    elif score >= 60:
        return {"tier": "Validated", "color": "#FF9800", "icon": "✓"}
    else:
        return {"tier": "Emerging", "color": "#9E9E9E", "icon": "🌱"}


def _generate_insights(
    overall_score: int,
    launch_signal: float,
    review_signal: float,
    trust_score: int,
    upvotes: int,
    review_count: int,
) -> list[str]:
    """Generate actionable insights based on score breakdown."""
    insights = []
    
    # Overall assessment
    if overall_score >= 80:
        insights.append("🎯 Highly credible startup ready for enterprise pilots")
    elif overall_score >= 60:
        insights.append("✓ Solid credibility, focus on building more social proof")
    else:
        insights.append("🌱 Early stage, prioritize reviews and community engagement")
    
    # Launch signal insights
    if launch_signal < 30:
        insights.append(f"📢 Low launch momentum ({upvotes} upvotes) - consider re-launching")
    elif launch_signal >= 70:
        insights.append("🚀 Strong community buzz - leverage for enterprise outreach")
    
    # Review signal insights
    if review_signal < 40:
        insights.append(f"📝 Need more reviews ({review_count} submitted) - target 20+ for credibility")
    elif review_signal >= 70:
        insights.append("⭐ Excellent user satisfaction - highlight in sales materials")
    
    # Trust score insights
    if trust_score < 60:
        insights.append("⚠️ Low trust score - verify data integrity and business metrics")
    elif trust_score >= 80:
        insights.append("🔒 High trust score - strong legitimacy and traction signals")
    
    return insights


def calculate_emerging_quadrant_position(
    overall_credibility_score: int,
    market_traction_score: int,
) -> dict:
    """
    Position startup in Gartner-style Emerging Quadrant.
    
    Quadrants:
        - Leaders: High credibility + High traction
        - Challengers: High credibility + Low traction
        - Visionaries: Low credibility + High traction (new/unproven)
        - Niche Players: Low credibility + Low traction
    
    Args:
        overall_credibility_score: 0-100 credibility score
        market_traction_score: 0-100 traction score
    
    Returns:
        Quadrant classification and coordinates
    """
    # Determine quadrant
    high_credibility = overall_credibility_score >= 70
    high_traction = market_traction_score >= 70
    
    if high_credibility and high_traction:
        quadrant = "Leaders"
        description = "High credibility and proven traction - enterprise ready"
    elif high_credibility and not high_traction:
        quadrant = "Challengers"
        description = "Strong credibility but growing traction - promising"
    elif not high_credibility and high_traction:
        quadrant = "Visionaries"
        description = "High growth but building credibility - high potential"
    else:
        quadrant = "Niche Players"
        description = "Building both credibility and traction - early stage"
    
    return {
        "quadrant": quadrant,
        "description": description,
        "coordinates": {
            "x": overall_credibility_score,  # X-axis: Credibility
            "y": market_traction_score,      # Y-axis: Traction
        },
    }
