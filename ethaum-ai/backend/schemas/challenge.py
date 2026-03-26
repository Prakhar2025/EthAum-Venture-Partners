"""EthAum AI — Challenge Board Schemas (Phase 3)."""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ChallengeCreate(BaseModel):
    """Schema for enterprise user creating a challenge."""
    title: str
    description: Optional[str] = None
    vertical: Optional[str] = None
    healthcare_category: Optional[str] = None
    compliance_required: Optional[List[str]] = None
    geography: Optional[List[str]] = None
    stage_required: Optional[str] = None
    prize_value: Optional[str] = None
    deadline: Optional[str] = None  # ISO 8601 string from frontend


class ChallengeResponse(BaseModel):
    """Full challenge response."""
    id: str
    posted_by: str
    posted_by_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    vertical: Optional[str] = None
    healthcare_category: Optional[str] = None
    compliance_required: Optional[List[str]] = None
    geography: Optional[List[str]] = None
    stage_required: Optional[str] = None
    prize_value: Optional[str] = None
    deadline: Optional[str] = None
    status: str = "open"
    application_count: int = 0
    created_at: Optional[str] = None


class ChallengeApplicationCreate(BaseModel):
    """Schema for startup applying to a challenge."""
    product_id: int           # INTEGER — matches products.id SERIAL
    solution_description: str


class ChallengeApplicationResponse(BaseModel):
    """Application response (visible to enterprise & startup)."""
    id: str
    challenge_id: str
    product_id: int
    product_name: Optional[str] = None
    applicant_id: str
    solution_description: Optional[str] = None
    status: str = "pending"
    created_at: Optional[str] = None


class ApplicationStatusUpdate(BaseModel):
    """Enterprise sets shortlisted / rejected / winner."""
    status: str   # pending | shortlisted | winner | rejected
