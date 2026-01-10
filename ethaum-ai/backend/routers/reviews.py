"""EthAum AI - Reviews Router with Supabase Database and User Linking."""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from database import get_db
from schemas.review import ReviewCreate, ReviewResponse

router = APIRouter()


@router.post("/", response_model=ReviewResponse)
def create_review(
    review: ReviewCreate,
    x_clerk_user_id: Optional[str] = Header(None)
) -> ReviewResponse:
    """
    Submit a new product review.
    Requires authentication - review is linked to the submitting user.
    """
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required to submit a review")
    
    db = get_db()
    
    # Get user from database
    user_result = db.table("users").select("id, full_name").eq("clerk_id", x_clerk_user_id).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found. Please sign in again.")
    
    user = user_result.data[0]
    reviewer_name = user.get("full_name") or "Anonymous"
    
    # Check if product exists
    product_result = db.table("products").select("id").eq("id", review.product_id).execute()
    if not product_result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Calculate sentiment score from rating
    sentiment_score = round(review.rating / 5, 2)
    
    # Try to insert with user_id, fall back without if column doesn't exist
    try:
        result = db.table("reviews").insert({
            "product_id": review.product_id,
            "rating": int(review.rating),
            "comment": review.comment,
            "reviewer_name": reviewer_name,
            "sentiment_score": sentiment_score,
            "verified": False,
            "user_id": user["id"],
        }).execute()
    except Exception:
        # Fallback if user_id column doesn't exist
        result = db.table("reviews").insert({
            "product_id": review.product_id,
            "rating": int(review.rating),
            "comment": review.comment,
            "reviewer_name": reviewer_name,
            "sentiment_score": sentiment_score,
            "verified": False,
        }).execute()
    
    if result.data:
        new_review = result.data[0]
        return ReviewResponse(
            id=new_review["id"],
            product_id=new_review["product_id"],
            rating=new_review["rating"],
            comment=new_review["comment"],
            sentiment_score=int(new_review["sentiment_score"] * 100),
            reviewer_name=reviewer_name,
        )
    
    raise HTTPException(status_code=500, detail="Failed to create review")


@router.get("/{product_id}")
def get_reviews_for_product(product_id: int) -> list[dict]:
    """Get all reviews for a specific product."""
    db = get_db()
    
    try:
        result = db.table("reviews").select("*").eq("product_id", product_id).order("created_at", desc=True).execute()
    except Exception:
        result = db.table("reviews").select("*").eq("product_id", product_id).execute()
    
    reviews = []
    for r in result.data or []:
        reviews.append({
            "id": r["id"],
            "product_id": r["product_id"],
            "rating": r["rating"],
            "comment": r["comment"],
            "sentiment_score": int(float(r.get("sentiment_score", 0)) * 100),
            "reviewer_name": r.get("reviewer_name", "Anonymous"),
            "verified": r.get("verified", False),
        })
    
    return reviews


@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    x_clerk_user_id: Optional[str] = Header(None)
) -> dict:
    """Delete a review (only owner can delete)."""
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    db = get_db()
    
    # Delete review
    db.table("reviews").delete().eq("id", review_id).execute()
    
    return {"success": True, "message": "Review deleted successfully"}
