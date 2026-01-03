"""EthAum AI - Launch Schemas."""

from pydantic import BaseModel


class LaunchCreate(BaseModel):
    """Schema for creating a new product launch."""

    product_id: int
    tagline: str
    description: str


class LaunchResponse(BaseModel):
    """Schema for launch response."""

    id: int
    product_id: int
    upvotes: int
