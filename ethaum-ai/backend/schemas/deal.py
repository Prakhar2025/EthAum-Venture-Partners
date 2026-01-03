"""EthAum AI - Deal Schemas for AppSumo-Style Pilots."""

from pydantic import BaseModel


class DealResponse(BaseModel):
    """Schema for enterprise pilot deal."""

    id: int
    product_id: int
    startup_name: str
    pilot_title: str
    description: str
    ideal_buyer: str
    credibility_score: int
    pilot_duration: str
    status: str  # "open" or "limited"


class PilotRequest(BaseModel):
    """Schema for requesting a pilot."""

    deal_id: int
    company_name: str
    contact_email: str


class PilotRequestResponse(BaseModel):
    """Response after submitting a pilot request."""

    success: bool
    message: str
    deal_id: int
    company_name: str
