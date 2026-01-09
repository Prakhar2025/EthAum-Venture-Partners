"""EthAum AI - User Schemas."""

from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum


class UserRole(str, Enum):
    FOUNDER = "founder"
    BUYER = "buyer"
    ADMIN = "admin"


class UserCreate(BaseModel):
    """Schema for creating/syncing a user from Clerk."""
    clerk_id: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: UserRole = UserRole.BUYER
    company_name: Optional[str] = None


class UserResponse(BaseModel):
    """Schema for user response."""
    id: str
    clerk_id: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: UserRole
    company_name: Optional[str] = None


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    role: Optional[UserRole] = None
