"""EthAum AI - FastAPI Application Entry Point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import products, launches, reviews, insights

app = FastAPI(
    title="EthAum AI",
    description="AI-Powered SaaS Marketplace for Series A-D Startups - Combining Product Hunt + G2 + Gartner",
    version="0.1.0",
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/api/v1/products", tags=["Products"])
app.include_router(launches.router, prefix="/api/v1/launches", tags=["Launches"])
app.include_router(reviews.router, prefix="/api/v1/reviews", tags=["Reviews"])
app.include_router(insights.router, prefix="/api/v1/insights", tags=["Insights"])


@app.get("/", tags=["Health"])
def health_check() -> dict:
    """Health check endpoint."""
    return {"status": "ok", "service": "ethaum-ai"}
