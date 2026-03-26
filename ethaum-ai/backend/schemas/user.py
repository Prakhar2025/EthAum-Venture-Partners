"""EthAum AI - User Schemas."""

from pydantic import BaseModel
from typing import Optional
from enum import Enum


# ─────────────────────────────────────────────────
# V0 Roles — DO NOT MODIFY (live product depends on these)
# ─────────────────────────────────────────────────
class UserRole(str, Enum):
    FOUNDER = "founder"
    BUYER = "buyer"
    ADMIN = "admin"


# ─────────────────────────────────────────────────
# V2 Roles — Healthcare Marketplace Pivot (Phase 1)
# ─────────────────────────────────────────────────
class UserRoleV2(str, Enum):
    STARTUP = "startup"
    ENTERPRISE = "enterprise"
    INVESTOR = "investor"
    ADMIN = "admin"


class UserCreate(BaseModel):
    """Schema for creating/syncing a user from Clerk."""
    clerk_id: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    # V0 legacy role — preserved
    role: UserRole = UserRole.BUYER
    company_name: Optional[str] = None


class UserResponse(BaseModel):
    """Schema for user response."""
    id: str
    clerk_id: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    # V0 legacy role
    role: UserRole
    company_name: Optional[str] = None
    # V2 fields — Phase 1 additions
    role_v2: Optional[UserRoleV2] = None
    onboarding_complete: Optional[bool] = False
    company_website: Optional[str] = None
    verified: Optional[bool] = False


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    # V0 legacy
    role: Optional[UserRole] = None
    # V2 fields
    role_v2: Optional[UserRoleV2] = None
    company_website: Optional[str] = None
