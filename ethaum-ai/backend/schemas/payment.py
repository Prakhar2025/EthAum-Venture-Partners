"""EthAum AI — Payments Schemas (Phase 5)."""
from pydantic import BaseModel
from typing import Optional


class CheckoutRequest(BaseModel):
    plan: str   # starter | growth | enterprise_buyer | investor
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


class SubscriptionResponse(BaseModel):
    plan: str
    status: str
    current_period_end: Optional[str] = None
    cancel_at_period_end: bool = False
    stripe_subscription_id: Optional[str] = None
