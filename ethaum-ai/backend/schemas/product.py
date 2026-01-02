"""EthAum AI - Product Schemas."""

from pydantic import BaseModel


class ProductCreate(BaseModel):
    """Schema for creating a new product submission."""

    name: str
    website: str
    category: str
    funding_stage: str


class ProductResponse(BaseModel):
    """Schema for product response with trust score."""

    id: int
    name: str
    website: str
    category: str
    funding_stage: str
    trust_score: int
