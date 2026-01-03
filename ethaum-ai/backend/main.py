"""EthAum AI - FastAPI Application Entry Point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import products, launches, reviews, insights, deals, matchmaking

app = FastAPI(
    title="EthAum AI",
    description="AI-Powered SaaS Marketplace for Series A-D Startups - Combining Product Hunt + G2 + Gartner + AppSumo",
    version="0.2.0",
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core Features
app.include_router(products.router, prefix="/api/v1/products", tags=["Products"])
app.include_router(launches.router, prefix="/api/v1/launches", tags=["Launches - Product Hunt"])
app.include_router(reviews.router, prefix="/api/v1/reviews", tags=["Reviews - G2"])
app.include_router(insights.router, prefix="/api/v1/insights", tags=["Insights - Gartner"])

# NEW: AppSumo-Style Deals & AI Matchmaking
app.include_router(deals.router, prefix="/api/v1/deals", tags=["Deals - AppSumo"])
app.include_router(matchmaking.router, prefix="/api/v1/matchmaking", tags=["AI Matchmaking"])


@app.get("/", tags=["Health"])
def health_check() -> dict:
    """Health check endpoint."""
    return {"status": "ok", "service": "ethaum-ai"}
