"""EthAum AI - Analytics Router.

This router provides trend dashboards and analytics
for Series A-D startups on the platform.

NOTE: This is MVP/Demo mode with simulated analytics data.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/dashboard")
def get_analytics_dashboard() -> dict:
    """
    Get the main analytics dashboard data.
    
    Provides trend insights for Series A-D startups including:
    - Top performing categories
    - Trending startups
    - Platform metrics
    """
    return {
        "overview": {
            "total_startups": 156,
            "total_launches_this_week": 23,
            "total_upvotes_this_week": 4521,
            "total_enterprise_pilots": 47,
            "average_trust_score": 78.5,
        },
        "trending_categories": [
            {"name": "AI/ML", "growth": 45, "startups": 52},
            {"name": "DevOps", "growth": 32, "startups": 38},
            {"name": "FinTech", "growth": 28, "startups": 31},
            {"name": "Security", "growth": 24, "startups": 22},
            {"name": "HealthTech", "growth": 18, "startups": 13},
        ],
        "top_performers": [
            {"name": "NeuraTech", "trust_score": 92, "upvotes": 847, "pilots_requested": 12},
            {"name": "CloudSync", "trust_score": 87, "upvotes": 623, "pilots_requested": 8},
            {"name": "FinLedger", "trust_score": 78, "upvotes": 412, "pilots_requested": 6},
        ],
        "funding_distribution": {
            "Series A": {"count": 68, "percentage": 44},
            "Series B": {"count": 52, "percentage": 33},
            "Series C": {"count": 28, "percentage": 18},
            "Series D": {"count": 8, "percentage": 5},
        },
    }


@router.get("/trends")
def get_trends() -> dict:
    """
    Get trending startups and categories with analysis.
    """
    return {
        "weekly_trends": {
            "rising_stars": [
                {
                    "name": "NeuraTech",
                    "change": "+156%",
                    "reason": "Featured in AI Weekly newsletter",
                    "trust_score": 92,
                },
                {
                    "name": "SecureFlow",
                    "change": "+89%",
                    "reason": "New enterprise pilot announcements",
                    "trust_score": 84,
                },
            ],
            "category_momentum": [
                {"category": "AI/ML", "trend": "up", "score": 94},
                {"category": "Security", "trend": "up", "score": 87},
                {"category": "FinTech", "trend": "stable", "score": 72},
                {"category": "DevOps", "trend": "stable", "score": 68},
            ],
        },
        "enterprise_interest": {
            "most_requested_categories": ["AI/ML", "Security", "FinTech"],
            "pilot_conversion_rate": "34%",
            "average_deal_size": "$45,000",
        },
        "ai_predictions": {
            "next_hot_category": "AISecOps (AI + Security + DevOps)",
            "confidence": 0.78,
            "reasoning": "Convergence of AI, security, and automation trends",
        },
    }


@router.get("/metrics/{product_id}")
def get_product_metrics(product_id: int) -> dict:
    """
    Get detailed analytics for a specific product.
    """
    # Simulated metrics data
    return {
        "product_id": product_id,
        "engagement": {
            "page_views_30d": 2847,
            "unique_visitors_30d": 1923,
            "avg_time_on_page": "2m 34s",
            "bounce_rate": "32%",
        },
        "conversion": {
            "profile_to_website": "18%",
            "website_to_pilot_request": "12%",
            "overall_funnel": "2.2%",
        },
        "comparison": {
            "vs_category_average": "+34%",
            "vs_same_funding_stage": "+28%",
            "trust_score_percentile": 89,
        },
        "growth": {
            "upvotes_growth_30d": "+45%",
            "reviews_growth_30d": "+23%",
            "trust_score_change_30d": "+4",
        },
        "recommendations": [
            "Add more customer testimonials to improve conversion",
            "Consider launching a new feature update to boost engagement",
            "Your trust score is in the top 15% - highlight this on your website",
        ],
    }
