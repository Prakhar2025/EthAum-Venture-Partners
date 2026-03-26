"""EthAum AI - Users Router with Supabase Database."""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from database import get_db
from schemas.user import UserCreate, UserResponse, UserUpdate, UserRole, UserRoleV2

router = APIRouter()


def _build_user_response(user: dict) -> UserResponse:
    """Build a UserResponse from a raw Supabase row, including V2 fields."""
    # Safely coerce V2 role — rows pre-Phase-1 will have None
    role_v2_raw = user.get("role_v2")
    role_v2 = UserRoleV2(role_v2_raw) if role_v2_raw else None

    return UserResponse(
        id=str(user["id"]),
        clerk_id=user["clerk_id"],
        email=user["email"],
        full_name=user.get("full_name"),
        avatar_url=user.get("avatar_url"),
        role=UserRole(user["role"]),
        company_name=user.get("company_name"),
        # V2 additions
        role_v2=role_v2,
        onboarding_complete=user.get("onboarding_complete", False),
        company_website=user.get("company_website"),
        verified=user.get("verified", False),
    )


@router.post("/sync", response_model=UserResponse)
def sync_user(user: UserCreate) -> UserResponse:
    """
    Sync user from Clerk to database.
    Called when user signs up or signs in.
    V0-safe: only updates email/name/avatar — never overwrites role or role_v2.
    """
    db = get_db()

    # Check if user exists
    existing = db.table("users").select("*").eq("clerk_id", user.clerk_id).execute()

    if existing.data:
        # Update mutable profile fields only — preserve all role/onboarding state
        db.table("users").update({
            "email": user.email,
            "full_name": user.full_name,
            "avatar_url": user.avatar_url,
        }).eq("clerk_id", user.clerk_id).execute()
        # Re-fetch to get all columns including V2 fields
        refreshed = db.table("users").select("*").eq("clerk_id", user.clerk_id).execute()
        return _build_user_response(refreshed.data[0])

    # Create new user — role_v2 defaults to 'startup' via DB DEFAULT
    result = db.table("users").insert({
        "clerk_id": user.clerk_id,
        "email": user.email,
        "full_name": user.full_name,
        "avatar_url": user.avatar_url,
        "role": user.role.value,
        "company_name": user.company_name,
        "onboarding_complete": False,
    }).execute()

    if result.data:
        return _build_user_response(result.data[0])

    raise HTTPException(status_code=500, detail="Failed to create user")


@router.get("/me")
def get_current_user(x_clerk_user_id: Optional[str] = Header(None)) -> UserResponse:
    """
    Get current user by Clerk ID from header.
    Returns V0 and V2 fields — used by frontend useUserSync and Header component.
    """
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    db = get_db()
    result = db.table("users").select("*").eq("clerk_id", x_clerk_user_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")

    return _build_user_response(result.data[0])


@router.put("/me", response_model=UserResponse)
def update_current_user(
    update: UserUpdate,
    x_clerk_user_id: Optional[str] = Header(None)
) -> UserResponse:
    """
    Update current user's profile (V0 and V2 fields).
    """
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    db = get_db()

    update_data: dict = {}
    if update.full_name is not None:
        update_data["full_name"] = update.full_name
    if update.company_name is not None:
        update_data["company_name"] = update.company_name
    # V2 fields
    if update.role_v2 is not None:
        update_data["role_v2"] = update.role_v2.value
    if update.company_website is not None:
        update_data["company_website"] = update.company_website

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = db.table("users").update(update_data).eq("clerk_id", x_clerk_user_id).execute()

    if result.data:
        return _build_user_response(result.data[0])

    raise HTTPException(status_code=404, detail="User not found")


@router.get("/{clerk_id}")
def get_user_by_clerk_id(clerk_id: str) -> UserResponse:
    """
    Get user by Clerk ID (public endpoint).
    """
    db = get_db()
    result = db.table("users").select("*").eq("clerk_id", clerk_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")

    return _build_user_response(result.data[0])


@router.put("/{user_id}/role")
def update_user_role(
    user_id: str,
    role: UserRole,
    x_clerk_user_id: Optional[str] = Header(None)
) -> dict:
    """
    Update user role (admin only).
    """
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = get_db()
    
    # Check if current user is admin
    admin_check = db.table("users").select("role").eq("clerk_id", x_clerk_user_id).execute()
    if not admin_check.data or admin_check.data[0]["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Update target user's role
    result = db.table("users").update({"role": role.value}).eq("id", user_id).execute()
    
    if result.data:
        return {"success": True, "message": f"Role updated to {role.value}"}
    
    raise HTTPException(status_code=404, detail="User not found")
