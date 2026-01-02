"""EthAum AI - FastAPI Application Entry Point."""

from fastapi import FastAPI

from routers import products

app = FastAPI(
    title="EthAum AI",
    description="AI-Powered SaaS Marketplace for Series A-D Startups",
    version="0.1.0",
)

app.include_router(products.router, prefix="/api/v1/products", tags=["Products"])


@app.get("/", tags=["Health"])
def health_check() -> dict:
    """Health check endpoint."""
    return {"status": "ok", "service": "ethaum-ai"}
