"""EthAum AI — Onboarding Schemas (Phase 1)."""

from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from enum import Enum


class UserRoleV2(str, Enum):
    """V2 roles for the healthcare marketplace pivot."""
    STARTUP = "startup"
    ENTERPRISE = "enterprise"
    INVESTOR = "investor"
    ADMIN = "admin"


# ─── ROLE-SPECIFIC FORM DATA ─────────────────────────────────

class StartupOnboardingData(BaseModel):
    """Onboarding form data for Startup Founders."""
    company_name: str
    product_name: str
    website_url: str
    linkedin_url: Optional[str] = None
    revenue_stage: Optional[str] = None  # seed|series_a|series_b|series_c|series_d
    vertical: Optional[str] = None       # healthcare|edtech|fintech|saas|hardware|hospitality
    healthcare_category: Optional[str] = None
    compliance: Optional[List[str]] = None   # ['hipaa','fda','ce_mark','iso_13485','soc2','gdpr']
    geography: Optional[List[str]] = None    # ['us','eu','india','asean','global']
    team_size: Optional[str] = None          # 1-10|11-50|51-200|200+
    total_funding: Optional[str] = None
    short_description: Optional[str] = None  # max 200 chars


class EnterpriseOnboardingData(BaseModel):
    """Onboarding form data for Enterprise Buyers."""
    company_name: str
    company_website: str
    industry: Optional[str] = None  # hospital|pharma|insurance|corporate|government|other
    geography: Optional[List[str]] = None
    looking_for: Optional[List[str]] = None  # healthcare categories they need solutions for
    company_size: Optional[str] = None       # 100-500|500-2000|2000-10000|10000+
    contact_name: Optional[str] = None
    contact_title: Optional[str] = None


class InvestorOnboardingData(BaseModel):
    """Onboarding form data for Investors / VCs."""
    fund_name: str
    fund_website: Optional[str] = None
    stage_focus: Optional[List[str]] = None   # seed|series_a|series_b|series_c|series_d
    sector_focus: Optional[List[str]] = None  # default: ['healthcare']
    geography_focus: Optional[List[str]] = None
    check_size: Optional[str] = None          # <250k|250k-1m|1m-5m|5m-25m|25m+
    linkedin_url: Optional[str] = None


# ─── TOP-LEVEL REQUEST ────────────────────────────────────────

class OnboardingRequest(BaseModel):
    """
    Unified onboarding payload.
    The `data` dict is validated per-role inside the router.
    """
    role_v2: UserRoleV2
    # Flat fields extracted for top-level storage on the users table
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    # Full form data stored as JSONB blob
    data: dict


class OnboardingResponse(BaseModel):
    """Response after successful onboarding."""
    success: bool
    role_v2: UserRoleV2
    redirect_to: str  # e.g. /dashboard/startup
    message: str
