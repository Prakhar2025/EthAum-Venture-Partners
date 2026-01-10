"""EthAum AI - Products Router with Supabase Database and User Linking."""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from database import get_db
from schemas.product import ProductCreate, ProductResponse

router = APIRouter()


@router.post("/", response_model=ProductResponse)
def create_product(
    product: ProductCreate,
    x_clerk_user_id: Optional[str] = Header(None)
) -> ProductResponse:
    """
    Submit a new startup for credibility scoring.
    Requires authentication - product is linked to the submitting user.
    """
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required to submit a product")
    
    db = get_db()
    
    # Get user from database
    user_result = db.table("users").select("id, role").eq("clerk_id", x_clerk_user_id).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found. Please sign in again.")
    
    user = user_result.data[0]
    
    # Calculate initial trust score (base score for new products)
    initial_score = 70
    
    result = db.table("products").insert({
        "name": product.name,
        "website": product.website,
        "category": product.category,
        "funding_stage": product.funding_stage,
        "description": product.description,
        "trust_score": initial_score,
        "data_integrity": 70,
        "market_traction": 70,
        "user_sentiment": 70,
        "user_id": user["id"],
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
            description=new_product.get("description"),
            user_id=str(new_product.get("user_id", "")),
        )
    
    raise HTTPException(status_code=500, detail="Failed to create product")


@router.get("/", response_model=list[dict])
def list_products() -> list[dict]:
    """List all startups with basic info."""
    db = get_db()
    result = db.table("products").select(
        "id, name, trust_score, category, funding_stage, website, description, user_id"
    ).execute()
    return result.data if result.data else []


@router.get("/my-products")
def get_my_products(x_clerk_user_id: Optional[str] = Header(None)) -> list[dict]:
    """Get products submitted by the current user."""
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    db = get_db()
    
    # Get user
    user_result = db.table("users").select("id").eq("clerk_id", x_clerk_user_id).execute()
    if not user_result.data:
        return []
    
    user_id = user_result.data[0]["id"]
    
    # Get user's products
    result = db.table("products").select("*").eq("user_id", user_id).execute()
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
    
    # Get owner info if product has user_id
    owner_info = None
    if product.get("user_id"):
        owner_result = db.table("users").select("full_name, email").eq("id", product["user_id"]).execute()
        if owner_result.data:
            owner_info = owner_result.data[0]
    
    # Get launch data
    launch_result = db.table("launches").select("*").eq("product_id", product_id).execute()
    launch_data = launch_result.data[0] if launch_result.data else {
        "upvotes": 0, "rank": 0, "is_featured": False
    }
    
    # Get reviews count
    reviews_result = db.table("reviews").select("id").eq("product_id", product_id).execute()
    reviews_count = len(reviews_result.data) if reviews_result.data else 0
    
    return {
        "id": product["id"],
        "name": product["name"],
        "website": product["website"],
        "category": product["category"],
        "funding_stage": product["funding_stage"],
        "description": product.get("description"),
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
        },
        "reviews_count": reviews_count,
        "owner": owner_info,
    }


@router.put("/{product_id}")
def update_product(
    product_id: int,
    product: ProductCreate,
    x_clerk_user_id: Optional[str] = Header(None)
) -> dict:
    """Update a product (only owner can update)."""
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    db = get_db()
    
    # Get user
    user_result = db.table("users").select("id").eq("clerk_id", x_clerk_user_id).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Check product ownership
    product_result = db.table("products").select("user_id").eq("id", product_id).execute()
    if not product_result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if str(product_result.data[0].get("user_id")) != str(user_id):
        raise HTTPException(status_code=403, detail="You can only edit your own products")
    
    # Update product
    result = db.table("products").update({
        "name": product.name,
        "website": product.website,
        "category": product.category,
        "funding_stage": product.funding_stage,
        "description": product.description,
    }).eq("id", product_id).execute()
    
    if result.data:
        return {"success": True, "message": "Product updated successfully"}
    
    raise HTTPException(status_code=500, detail="Failed to update product")


@router.get("/{product_id}/score")
def get_product_score(product_id: int) -> dict:
    """Get only the trust score for a startup."""
    db = get_db()
    result = db.table("products").select("trust_score").eq("id", product_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"trust_score": result.data[0]["trust_score"]}
