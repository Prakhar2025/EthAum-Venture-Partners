"""EthAum AI - Users Router with Supabase Database."""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from database import get_db
from schemas.user import UserCreate, UserResponse, UserUpdate, UserRole

router = APIRouter()


@router.post("/sync", response_model=UserResponse)
def sync_user(user: UserCreate) -> UserResponse:
    """
    Sync user from Clerk to database.
    Called when user signs up or signs in.
    """
    db = get_db()
    
    # Check if user exists
    existing = db.table("users").select("*").eq("clerk_id", user.clerk_id).execute()
    
    if existing.data:
        # Update existing user
        result = db.table("users").update({
            "email": user.email,
            "full_name": user.full_name,
            "avatar_url": user.avatar_url,
        }).eq("clerk_id", user.clerk_id).execute()
        
        return UserResponse(**existing.data[0])
    
    # Create new user
    result = db.table("users").insert({
        "clerk_id": user.clerk_id,
        "email": user.email,
        "full_name": user.full_name,
        "avatar_url": user.avatar_url,
        "role": user.role.value,
        "company_name": user.company_name,
    }).execute()
    
    if result.data:
        return UserResponse(
            id=str(result.data[0]["id"]),
            clerk_id=result.data[0]["clerk_id"],
            email=result.data[0]["email"],
            full_name=result.data[0]["full_name"],
            avatar_url=result.data[0]["avatar_url"],
            role=UserRole(result.data[0]["role"]),
            company_name=result.data[0]["company_name"],
        )
    
    raise HTTPException(status_code=500, detail="Failed to create user")


@router.get("/me")
def get_current_user(x_clerk_user_id: Optional[str] = Header(None)) -> UserResponse:
    """
    Get current user by Clerk ID from header.
    """
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = get_db()
    result = db.table("users").select("*").eq("clerk_id", x_clerk_user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = result.data[0]
    return UserResponse(
        id=str(user["id"]),
        clerk_id=user["clerk_id"],
        email=user["email"],
        full_name=user["full_name"],
        avatar_url=user["avatar_url"],
        role=UserRole(user["role"]),
        company_name=user["company_name"],
    )


@router.put("/me", response_model=UserResponse)
def update_current_user(
    update: UserUpdate,
    x_clerk_user_id: Optional[str] = Header(None)
) -> UserResponse:
    """
    Update current user's profile.
    """
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = get_db()
    
    # Build update data
    update_data = {}
    if update.full_name is not None:
        update_data["full_name"] = update.full_name
    if update.company_name is not None:
        update_data["company_name"] = update.company_name
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = db.table("users").update(update_data).eq("clerk_id", x_clerk_user_id).execute()
    
    if result.data:
        user = result.data[0]
        return UserResponse(
            id=str(user["id"]),
            clerk_id=user["clerk_id"],
            email=user["email"],
            full_name=user["full_name"],
            avatar_url=user["avatar_url"],
            role=UserRole(user["role"]),
            company_name=user["company_name"],
        )
    
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
    
    user = result.data[0]
    return UserResponse(
        id=str(user["id"]),
        clerk_id=user["clerk_id"],
        email=user["email"],
        full_name=user["full_name"],
        avatar_url=user["avatar_url"],
        role=UserRole(user["role"]),
        company_name=user["company_name"],
    )


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
