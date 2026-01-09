"""EthAum AI - Launches Router with Supabase Database."""

from fastapi import APIRouter, HTTPException
from database import get_db
from schemas.launch import LaunchCreate, LaunchResponse

router = APIRouter()


@router.post("/", response_model=LaunchResponse)
def create_launch(launch: LaunchCreate) -> LaunchResponse:
    """Create a new product launch."""
    db = get_db()
    
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
def upvote_launch(launch_id: int) -> dict:
    """Increment upvotes for a launch."""
    db = get_db()
    
    # Get current upvotes
    result = db.table("launches").select("upvotes").eq("id", launch_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Launch not found")
    
    current_upvotes = result.data[0]["upvotes"]
    new_upvotes = current_upvotes + 1
    
    # Update upvotes
    db.table("launches").update({"upvotes": new_upvotes}).eq("id", launch_id).execute()
    
    return {"id": launch_id, "upvotes": new_upvotes}


@router.get("/leaderboard")
def get_leaderboard() -> list[dict]:
    """Get launches sorted by upvotes (descending)."""
    db = get_db()
    
    # Get launches with product info
    result = db.table("launches").select("*, products(name, category)").order("upvotes", desc=True).execute()
    
    leaderboard = []
    for launch in result.data or []:
        product = launch.get("products", {}) or {}
        leaderboard.append({
            "id": launch["id"],
            "product_id": launch["product_id"],
            "name": product.get("name", "Unknown"),
            "category": product.get("category", ""),
            "upvotes": launch["upvotes"],
            "rank": launch["rank"],
            "is_featured": launch["is_featured"],
        })
    
    return leaderboard
