"""EthAum AI - Launch Schemas."""

from pydantic import BaseModel
from typing import Optional


class LaunchCreate(BaseModel):
    """Schema for creating a new product launch."""
    product_id: int
    tagline: Optional[str] = None
    description: Optional[str] = None


class LaunchResponse(BaseModel):
    """Schema for launch response."""
    id: int
    product_id: int
    upvotes: int
