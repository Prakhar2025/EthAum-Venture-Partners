"""EthAum AI — Report Schemas (Phase 6)."""
from pydantic import BaseModel
from typing import Optional


class CategoryTrend(BaseModel):
    category: str
    count: int
    avg_trust_score: float
    is_hot: bool = False


class TrendsResponse(BaseModel):
    categories: list[CategoryTrend]
    total_startups: int
    avg_platform_trust_score: float


class ReportGenerateResponse(BaseModel):
    success: bool
    product_id: int
    product_name: str
    message: str
