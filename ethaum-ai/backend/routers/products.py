"""EthAum AI - Products Router with Supabase Database."""

from fastapi import APIRouter, HTTPException
from database import get_db
from schemas.product import ProductCreate, ProductResponse

router = APIRouter()


@router.post("/", response_model=ProductResponse)
def create_product(product: ProductCreate) -> ProductResponse:
    """Submit a new startup for credibility scoring."""
    db = get_db()
    
    # Calculate initial trust score (basic formula)
    initial_score = 70  # Base score for new products
    
    result = db.table("products").insert({
        "name": product.name,
        "website": product.website,
        "category": product.category,
        "funding_stage": product.funding_stage,
        "trust_score": initial_score,
        "data_integrity": 70,
        "market_traction": 70,
        "user_sentiment": 70,
    }).execute()
    
    if result.data:
        new_product = result.data[0]
        return ProductResponse(
            id=new_product["id"],
            name=new_product["name"],
            website=new_product["website"],
            category=new_product["category"],
            funding_stage=new_product["funding_stage"],
            trust_score=new_product["trust_score"],
        )
    
    raise HTTPException(status_code=500, detail="Failed to create product")


@router.get("/", response_model=list[dict])
def list_products() -> list[dict]:
    """List all startups with basic info."""
    db = get_db()
    result = db.table("products").select("id, name, trust_score, category, funding_stage, website").execute()
    return result.data if result.data else []


@router.get("/{product_id}")
def get_product(product_id: int) -> dict:
    """Get startup details with trust score breakdown."""
    db = get_db()
    
    # Get product
    product_result = db.table("products").select("*").eq("id", product_id).execute()
    
    if not product_result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = product_result.data[0]
    
    # Get launch data
    launch_result = db.table("launches").select("*").eq("product_id", product_id).execute()
    launch_data = launch_result.data[0] if launch_result.data else {
        "upvotes": 0, "rank": 0, "is_featured": False
    }
    
    return {
        "id": product["id"],
        "name": product["name"],
        "website": product["website"],
        "category": product["category"],
        "funding_stage": product["funding_stage"],
        "trust_score": product["trust_score"],
        "score_breakdown": {
            "data_integrity": product["data_integrity"],
            "market_traction": product["market_traction"],
            "user_sentiment": product["user_sentiment"],
        },
        "launch": {
            "is_launched": True,
            "upvotes": launch_data.get("upvotes", 0),
            "rank": launch_data.get("rank", 0),
        }
    }


@router.get("/{product_id}/score")
def get_product_score(product_id: int) -> dict:
    """Get only the trust score for a startup."""
    db = get_db()
    result = db.table("products").select("trust_score").eq("id", product_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"trust_score": result.data[0]["trust_score"]}
