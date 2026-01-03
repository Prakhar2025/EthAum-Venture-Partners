"""EthAum AI - Reviews Router."""

from fastapi import APIRouter

from schemas.review import ReviewCreate, ReviewResponse

router = APIRouter()

# In-memory storage
REVIEWS: list[dict] = []


@router.post("/", response_model=ReviewResponse)
def create_review(review: ReviewCreate) -> ReviewResponse:
    """Submit a new product review."""
    sentiment_score = int(review.rating * 20)

    new_review = {
        "id": len(REVIEWS) + 1,
        "product_id": review.product_id,
        "rating": review.rating,
        "comment": review.comment,
        "sentiment_score": sentiment_score,
    }
    REVIEWS.append(new_review)

    return ReviewResponse(**new_review)


@router.get("/{product_id}")
def get_reviews_for_product(product_id: int) -> list[ReviewResponse]:
    """Get all reviews for a specific product."""
    product_reviews = [r for r in REVIEWS if r["product_id"] == product_id]
    return [ReviewResponse(**r) for r in product_reviews]
