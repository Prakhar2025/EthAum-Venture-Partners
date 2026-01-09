"""EthAum AI - Reviews Router with Supabase Database."""

from fastapi import APIRouter, HTTPException
from database import get_db
from schemas.review import ReviewCreate, ReviewResponse

router = APIRouter()


@router.post("/", response_model=ReviewResponse)
def create_review(review: ReviewCreate) -> ReviewResponse:
    """Submit a new product review."""
    db = get_db()
    
    # Calculate sentiment score from rating (simple formula)
    sentiment_score = round(review.rating / 5, 2)
    
    result = db.table("reviews").insert({
        "product_id": review.product_id,
        "rating": review.rating,
        "comment": review.comment,
        "reviewer_name": getattr(review, 'reviewer_name', 'Anonymous'),
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
        )
    
    raise HTTPException(status_code=500, detail="Failed to create review")


@router.get("/{product_id}")
def get_reviews_for_product(product_id: int) -> list[ReviewResponse]:
    """Get all reviews for a specific product."""
    db = get_db()
    result = db.table("reviews").select("*").eq("product_id", product_id).execute()
    
    reviews = []
    for r in result.data or []:
        reviews.append(ReviewResponse(
            id=r["id"],
            product_id=r["product_id"],
            rating=r["rating"],
            comment=r["comment"],
            sentiment_score=int(float(r["sentiment_score"]) * 100),
        ))
    
    return reviews
