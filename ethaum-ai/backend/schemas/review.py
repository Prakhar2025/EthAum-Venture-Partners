"""EthAum AI - Review Schemas."""

from pydantic import BaseModel


class ReviewCreate(BaseModel):
    """Schema for creating a new review."""

    product_id: int
    rating: float
    comment: str


class ReviewResponse(BaseModel):
    """Schema for review response with sentiment."""

    id: int
    product_id: int
    rating: float
    comment: str
    sentiment_score: int
