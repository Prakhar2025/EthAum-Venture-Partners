"""EthAum AI - Product Schemas."""

from pydantic import BaseModel, HttpUrl
from typing import Optional


class ProductCreate(BaseModel):
    """Schema for creating a new product submission."""
    name: str
    website: str
    category: str
    funding_stage: str
    description: Optional[str] = None
    tagline: Optional[str] = None


class ProductResponse(BaseModel):
    """Schema for product response with trust score."""
    id: int
    name: str
    website: str
    category: str
    funding_stage: str
    trust_score: int
    description: Optional[str] = None
    tagline: Optional[str] = None
    user_id: Optional[str] = None


class ProductWithOwner(ProductResponse):
    """Product with owner information."""
    owner_name: Optional[str] = None
    owner_email: Optional[str] = None
