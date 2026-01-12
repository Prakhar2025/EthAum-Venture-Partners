"""EthAum AI - FastAPI Application Entry Point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import (
    products,
    launches,
    reviews,
    insights,
    deals,
    matchmaking,
    comparisons,
    badges,
    templates,
    analytics,
    users,
    recommendations,
    admin,
)

app = FastAPI(
    title="EthAum AI",
    description="AI-Powered SaaS Marketplace for Series A-D Startups - Product Hunt + G2 + Gartner + AppSumo",
    version="2.0.0",
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== USER MANAGEMENT ==========
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])

# ========== CORE FEATURES ==========
# Product Hunt Style
app.include_router(products.router, prefix="/api/v1/products", tags=["Products"])
app.include_router(launches.router, prefix="/api/v1/launches", tags=["Launches"])
app.include_router(templates.router, prefix="/api/v1/templates", tags=["AI Launch Templates"])

# G2 Style
app.include_router(reviews.router, prefix="/api/v1/reviews", tags=["Reviews"])
app.include_router(comparisons.router, prefix="/api/v1/comparisons", tags=["Comparisons"])
app.include_router(badges.router, prefix="/api/v1/badges", tags=["Embeddable Badges"])

# Gartner Style
app.include_router(insights.router, prefix="/api/v1/insights", tags=["Insights & Quadrants"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics & Trends"])

# AppSumo Style
app.include_router(deals.router, prefix="/api/v1/deals", tags=["Enterprise Deals"])
app.include_router(matchmaking.router, prefix="/api/v1/matchmaking", tags=["AI Matchmaking"])

# AI Recommendations (Phase 3)
app.include_router(recommendations.router, prefix="/api/v1/recommendations", tags=["Smart Recommendations"])

# Admin Dashboard (Phase 4)
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin Dashboard"])


@app.get("/", tags=["Health"])
def health_check() -> dict:
    """Health check endpoint."""
    return {"status": "ok", "service": "ethaum-ai", "version": "2.0.0"}


