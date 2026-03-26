"""EthAum AI — Onboarding Router (Phase 1).

POST /api/v1/onboarding
  - Saves role_v2, onboarding data and writes role_v2 to Clerk publicMetadata
  - so Next.js middleware can enforce role-based dashboard routing in the Edge.
"""

import os
import httpx
from fastapi import APIRouter, HTTPException, Header
from typing import Optional

from database import get_db
from schemas.onboarding import OnboardingRequest, OnboardingResponse, UserRoleV2

router = APIRouter()

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY", "")
CLERK_API_BASE = "https://api.clerk.com/v1"

ROLE_DASHBOARDS: dict[str, str] = {
    "startup": "/dashboard/startup",
    "enterprise": "/dashboard/enterprise",
    "investor": "/dashboard/investor",
    "admin": "/admin",
}


async def _write_clerk_public_metadata(clerk_id: str, role_v2: str) -> None:
    """
    Patch publicMetadata on the Clerk user so Next.js Edge middleware
    can read role_v2 from sessionClaims without an extra network round-trip.
    Uses the Clerk Backend API — requires CLERK_SECRET_KEY.
    """
    if not CLERK_SECRET_KEY:
        # Gracefully degrade — middleware will fall back to /api/v1/users/me
        return

    url = f"{CLERK_API_BASE}/users/{clerk_id}/metadata"
    payload = {"public_metadata": {"role_v2": role_v2}}

    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.patch(
            url,
            json=payload,
            headers={
                "Authorization": f"Bearer {CLERK_SECRET_KEY}",
                "Content-Type": "application/json",
            },
        )
        if resp.status_code not in (200, 201):
            # Log, but don't fail the onboarding — Clerk sync is best-effort
            print(
                f"[onboarding] Clerk metadata patch failed for {clerk_id}: "
                f"{resp.status_code} {resp.text[:200]}"
            )


@router.post("", response_model=OnboardingResponse)
async def complete_onboarding(
    payload: OnboardingRequest,
    x_clerk_user_id: Optional[str] = Header(None),
) -> OnboardingResponse:
    """
    Save onboarding data and role_v2 for the authenticated user.

    Flow:
      1. Validate auth via X-Clerk-User-Id header
      2. Upsert role_v2, onboarding_complete, company details, and raw JSONB data
         into the `users` table
      3. Patch Clerk publicMetadata so Edge middleware can read role_v2
      4. Return redirect_to so the frontend knows where to send the user
    """
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    db = get_db()

    # Confirm user exists in our DB
    user_check = (
        db.table("users")
        .select("id, clerk_id")
        .eq("clerk_id", x_clerk_user_id)
        .execute()
    )
    if not user_check.data:
        raise HTTPException(status_code=404, detail="User not found. Please sync first.")

    # Build update payload — only include fields that are set
    update: dict = {
        "role_v2": payload.role_v2.value,
        "onboarding_complete": True,
        "onboarding_data": payload.data,
    }
    if payload.company_name:
        update["company_name"] = payload.company_name
    if payload.company_website:
        update["company_website"] = payload.company_website

    result = (
        db.table("users")
        .update(update)
        .eq("clerk_id", x_clerk_user_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save onboarding data")

    # Write role_v2 to Clerk publicMetadata for Edge middleware
    await _write_clerk_public_metadata(x_clerk_user_id, payload.role_v2.value)

    redirect_to = ROLE_DASHBOARDS.get(payload.role_v2.value, "/dashboard/startup")

    return OnboardingResponse(
        success=True,
        role_v2=payload.role_v2,
        redirect_to=redirect_to,
        message=f"Welcome! Your {payload.role_v2.value} profile is set up.",
    )


@router.get("/status")
def get_onboarding_status(
    x_clerk_user_id: Optional[str] = Header(None),
) -> dict:
    """
    Returns whether the current user has completed onboarding and their role_v2.
    Used by the frontend useUserSync hook on every page load.
    """
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    db = get_db()
    result = (
        db.table("users")
        .select("role_v2, onboarding_complete")
        .eq("clerk_id", x_clerk_user_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")

    user = result.data[0]
    return {
        "onboarding_complete": user.get("onboarding_complete", False),
        "role_v2": user.get("role_v2", "startup"),
        "redirect_to": ROLE_DASHBOARDS.get(user.get("role_v2", "startup"), "/dashboard/startup"),
    }
