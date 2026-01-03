"""EthAum AI - FastAPI Application Entry Point."""

from fastapi import FastAPI

from routers import products, launches

app = FastAPI(
    title="EthAum AI",
    description="AI-Powered SaaS Marketplace for Series A-D Startups",
    version="0.1.0",
)

app.include_router(products.router, prefix="/api/v1/products", tags=["Products"])
app.include_router(launches.router, prefix="/api/v1/launches", tags=["Launches"])


@app.get("/", tags=["Health"])
def health_check() -> dict:
    """Health check endpoint."""
    return {"status": "ok", "service": "ethaum-ai"}
