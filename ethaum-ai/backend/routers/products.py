"""EthAum AI - Products Router."""

from fastapi import APIRouter, HTTPException

from schemas.product import ProductCreate, ProductResponse
from services.signals import (
    calculate_data_integrity_score,
    calculate_market_traction_score,
    calculate_user_sentiment_score,
)
from services.scoring import calculate_trust_score

router = APIRouter()

# In-memory dummy data
DUMMY_PRODUCTS = [
    {"id": 1, "name": "NeuraTech", "website": "https://neuratech.ai", "category": "AI/ML", "funding_stage": "Series A", "trust_score": 92},
    {"id": 2, "name": "CloudSync", "website": "https://cloudsync.io", "category": "DevOps", "funding_stage": "Series B", "trust_score": 87},
    {"id": 3, "name": "FinLedger", "website": "https://finledger.com", "category": "FinTech", "funding_stage": "Series A", "trust_score": 78},
]


@router.post("/", response_model=ProductResponse)
def create_product(product: ProductCreate) -> ProductResponse:
    """Submit a new startup for credibility scoring."""
    new_product = ProductResponse(
        id=len(DUMMY_PRODUCTS) + 1,
        name=product.name,
        website=product.website,
        category=product.category,
        funding_stage=product.funding_stage,
        trust_score=85,
    )
    return new_product


@router.get("/", response_model=list[dict])
def list_products() -> list[dict]:
    """List all startups with basic info."""
    return [{"id": p["id"], "name": p["name"], "trust_score": p["trust_score"]} for p in DUMMY_PRODUCTS]


@router.get("/{product_id}")
def get_product(product_id: int) -> dict:
    """Get startup details with trust score breakdown."""
    for product in DUMMY_PRODUCTS:
        if product["id"] == product_id:
            # Mock raw inputs (would come from scraping/database in production)
            has_https = True
            domain_age_years = 3
            employee_count = 42
            average_rating = 4.2

            # Calculate individual signal scores
            data_integrity_score = calculate_data_integrity_score(has_https, domain_age_years)
            market_traction_score = calculate_market_traction_score(employee_count)
            user_sentiment_score = calculate_user_sentiment_score(average_rating)

            # Calculate final trust score
            trust_score = calculate_trust_score(
                data_integrity=data_integrity_score,
                market_traction=market_traction_score,
                user_sentiment=user_sentiment_score,
            )

            return {
                **product,
                "trust_score": trust_score,
                "score_breakdown": {
                    "data_integrity": data_integrity_score,
                    "market_traction": market_traction_score,
                    "user_sentiment": user_sentiment_score,
                },
                "launch": {
                    "is_launched": True,
                    "upvotes": 23,
                    "rank": 4
                }
            }

    raise HTTPException(status_code=404, detail="Product not found")



@router.get("/{product_id}/score")
def get_product_score(product_id: int) -> dict:
    """Get only the trust score for a startup."""
    for product in DUMMY_PRODUCTS:
        if product["id"] == product_id:
            return {"trust_score": product["trust_score"]}
    raise HTTPException(status_code=404, detail="Product not found")


