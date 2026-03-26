"""EthAum AI — Product Schemas V2 (Phase 2).

Extends the V0 product schema with healthcare depth fields.
V0 fields (name, website, category, funding_stage, description) are PRESERVED.
"""

from pydantic import BaseModel
from typing import Optional, List


# ─── V0 SCHEMAS — DO NOT MODIFY ──────────────────────────────────────────────

class ProductCreate(BaseModel):
    """V0 + V2 schema for creating a new product submission."""
    # V0 core fields (preserved)
    name: str
    website: str
    category: str
    funding_stage: str
    description: Optional[str] = None
    tagline: Optional[str] = None
    # V2 healthcare depth fields (all optional for backward compat)
    vertical: Optional[str] = None          # healthcare|edtech|fintech|saas|hardware|hospitality
    healthcare_category: Optional[str] = None
    compliance: Optional[List[str]] = None  # ['hipaa','fda','ce_mark','iso_13485','soc2','gdpr']
    revenue_stage: Optional[str] = None     # seed|series_a|series_b|series_c|series_d
    geography: Optional[List[str]] = None   # ['us','eu','india','asean','global']
    team_size: Optional[str] = None         # 1-10|11-50|51-200|200+
    total_funding: Optional[str] = None
    linkedin_url: Optional[str] = None
    pitch_deck_url: Optional[str] = None
    demo_video_url: Optional[str] = None
    integrations: Optional[List[str]] = None


class ProductResponse(BaseModel):
    """V0 + V2 product response schema."""
    # V0 fields
    id: int
    name: str
    website: str
    category: str
    funding_stage: str
    trust_score: int
    description: Optional[str] = None
    tagline: Optional[str] = None
    user_id: Optional[str] = None
    # V2 healthcare depth fields
    vertical: Optional[str] = None
    healthcare_category: Optional[str] = None
    compliance: Optional[List[str]] = None
    revenue_stage: Optional[str] = None
    geography: Optional[List[str]] = None
    team_size: Optional[str] = None
    total_funding: Optional[str] = None
    linkedin_url: Optional[str] = None
    pitch_deck_url: Optional[str] = None
    demo_video_url: Optional[str] = None
    integrations: Optional[List[str]] = None


class ProductWithOwner(ProductResponse):
    """Product with owner information."""
    owner_name: Optional[str] = None
    owner_email: Optional[str] = None


# ─── FILTER PARAMS ───────────────────────────────────────────────────────────

class ProductFilterParams(BaseModel):
    """Query parameters for marketplace filtering endpoint."""
    vertical: Optional[str] = None
    healthcare_category: Optional[str] = None          # comma-separated
    compliance: Optional[str] = None                   # comma-separated
    revenue_stage: Optional[str] = None                # comma-separated
    geography: Optional[str] = None                    # comma-separated
    trust_score_min: Optional[int] = None
    sort: Optional[str] = "trust_score"                # trust_score|latest|name
    search: Optional[str] = None
