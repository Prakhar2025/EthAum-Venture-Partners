"""EthAum AI - Launches Router with Supabase Database and Real Upvotes."""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from database import get_db
from schemas.launch import LaunchCreate, LaunchResponse

router = APIRouter()


@router.post("/", response_model=LaunchResponse)
def create_launch(
    launch: LaunchCreate,
    x_clerk_user_id: Optional[str] = Header(None)
) -> LaunchResponse:
    """Create a new product launch (requires authentication)."""
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    db = get_db()
    
    # Get user
    user_result = db.table("users").select("id").eq("clerk_id", x_clerk_user_id).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if product exists and belongs to user
    product_result = db.table("products").select("user_id").eq("id", launch.product_id).execute()
    if not product_result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    result = db.table("launches").insert({
        "product_id": launch.product_id,
        "upvotes": 0,
        "rank": 0,
        "is_featured": False,
    }).execute()
    
    if result.data:
        new_launch = result.data[0]
        return LaunchResponse(
            id=new_launch["id"],
            product_id=new_launch["product_id"],
            upvotes=new_launch["upvotes"],
        )
    
    raise HTTPException(status_code=500, detail="Failed to create launch")


@router.post("/{launch_id}/upvote")
def upvote_launch(
    launch_id: int,
    x_clerk_user_id: Optional[str] = Header(None)
) -> dict:
    """
    Upvote a launch (requires authentication).
    Each user can only upvote once per launch.
    """
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Sign in to upvote")
    
    db = get_db()
    
    # Get user
    user_result = db.table("users").select("id").eq("clerk_id", x_clerk_user_id).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Check if launch exists
    launch_result = db.table("launches").select("id, upvotes, product_id").eq("id", launch_id).execute()
    if not launch_result.data:
        raise HTTPException(status_code=404, detail="Launch not found")
    
    launch = launch_result.data[0]
    
    # Check if user already upvoted
    existing_upvote = db.table("upvotes").select("id").eq("user_id", user_id).eq("launch_id", launch_id).execute()
    
    if existing_upvote.data:
        # Remove upvote (toggle)
        db.table("upvotes").delete().eq("user_id", user_id).eq("launch_id", launch_id).execute()
        new_upvotes = max(0, launch["upvotes"] - 1)
        db.table("launches").update({"upvotes": new_upvotes}).eq("id", launch_id).execute()
        return {"id": launch_id, "upvotes": new_upvotes, "user_upvoted": False}
    else:
        # Add upvote
        db.table("upvotes").insert({
            "user_id": user_id,
            "launch_id": launch_id,
            "product_id": launch["product_id"],
        }).execute()
        new_upvotes = launch["upvotes"] + 1
        db.table("launches").update({"upvotes": new_upvotes}).eq("id", launch_id).execute()
        return {"id": launch_id, "upvotes": new_upvotes, "user_upvoted": True}


@router.get("/{launch_id}/upvote-status")
def get_upvote_status(
    launch_id: int,
    x_clerk_user_id: Optional[str] = Header(None)
) -> dict:
    """Check if current user has upvoted this launch."""
    if not x_clerk_user_id:
        return {"user_upvoted": False}
    
    db = get_db()
    
    user_result = db.table("users").select("id").eq("clerk_id", x_clerk_user_id).execute()
    if not user_result.data:
        return {"user_upvoted": False}
    
    user_id = user_result.data[0]["id"]
    
    existing = db.table("upvotes").select("id").eq("user_id", user_id).eq("launch_id", launch_id).execute()
    return {"user_upvoted": bool(existing.data)}


@router.get("/leaderboard")
def get_leaderboard(x_clerk_user_id: Optional[str] = Header(None)) -> list[dict]:
    """Get launches sorted by upvotes (descending)."""
    db = get_db()
    
    # Get user's upvoted launches if authenticated
    user_upvoted_ids = set()
    if x_clerk_user_id:
        user_result = db.table("users").select("id").eq("clerk_id", x_clerk_user_id).execute()
        if user_result.data:
            user_id = user_result.data[0]["id"]
            upvotes_result = db.table("upvotes").select("launch_id").eq("user_id", user_id).execute()
            user_upvoted_ids = {u["launch_id"] for u in upvotes_result.data or []}
    
    # Get launches with product info
    result = db.table("launches").select("*, products(name, category)").order("upvotes", desc=True).execute()
    
    leaderboard = []
    for i, launch in enumerate(result.data or []):
        product = launch.get("products", {}) or {}
        leaderboard.append({
            "id": launch["id"],
            "product_id": launch["product_id"],
            "name": product.get("name", "Unknown"),
            "category": product.get("category", ""),
            "upvotes": launch["upvotes"],
            "rank": i + 1,
            "is_featured": launch.get("is_featured", False),
            "user_upvoted": launch["id"] in user_upvoted_ids,
        })
    
    return leaderboard
