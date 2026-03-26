"""EthAum AI — Challenge Board Router (Phase 3 — Agorize-style).

Endpoints:
  POST   /api/v1/challenges              → enterprise creates challenge
  GET    /api/v1/challenges              → list open challenges (filtered)
  GET    /api/v1/challenges/{id}         → challenge detail
  POST   /api/v1/challenges/{id}/apply   → startup applies
  GET    /api/v1/challenges/{id}/applications → enterprise views applications
  PATCH  /api/v1/challenges/{id}/applications/{app_id} → update app status

Auth: X-Clerk-User-Id header (all write routes require it)
DB: Supabase singleton via get_db()
"""

from fastapi import APIRouter, HTTPException, Header, Query, Request
from typing import Optional
from database import get_db
from schemas.challenge import (
    ChallengeCreate,
    ChallengeResponse,
    ChallengeApplicationCreate,
    ChallengeApplicationResponse,
    ApplicationStatusUpdate,
)
import datetime

router = APIRouter()


# ─── HELPER ──────────────────────────────────────────────────────────────────

def _row_to_challenge(row: dict) -> dict:
    """Convert a Supabase row to a clean challenge dict."""
    return {
        "id":                  str(row["id"]),
        "posted_by":           row["posted_by"],
        "posted_by_name":      row.get("posted_by_name"),
        "title":               row["title"],
        "description":         row.get("description"),
        "vertical":            row.get("vertical"),
        "healthcare_category": row.get("healthcare_category"),
        "compliance_required": row.get("compliance_required") or [],
        "geography":           row.get("geography") or [],
        "stage_required":      row.get("stage_required"),
        "prize_value":         row.get("prize_value"),
        "deadline":            str(row["deadline"]) if row.get("deadline") else None,
        "status":              row.get("status", "open"),
        "application_count":   row.get("application_count", 0),
        "created_at":          str(row["created_at"]) if row.get("created_at") else None,
    }


# ─── CREATE CHALLENGE ─────────────────────────────────────────────────────────

@router.post("/", response_model=dict)
def create_challenge(
    challenge: ChallengeCreate,
    x_clerk_user_id: Optional[str] = Header(None),
) -> dict:
    """Enterprise user posts a new innovation challenge."""
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    db = get_db()

    # Fetch poster's display name from users table
    user_result = db.table("users").select("full_name, company_name, role_v2, role").eq("clerk_id", x_clerk_user_id).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found. Please sign in again.")

    user = user_result.data[0]
    # Accept enterprise role (role_v2 = 'enterprise') or legacy buyer
    role_v2 = (user.get("role_v2") or "").lower()
    legacy_role = (user.get("role") or "").lower()
    if role_v2 not in ("enterprise", "admin") and legacy_role not in ("buyer", "admin"):
        raise HTTPException(status_code=403, detail="Only enterprise users can post challenges")

    posted_by_name = user.get("company_name") or user.get("full_name") or "Enterprise"

    insert_data = {
        "posted_by":           x_clerk_user_id,
        "posted_by_name":      posted_by_name,
        "title":               challenge.title,
        "description":         challenge.description,
        "vertical":            challenge.vertical,
        "healthcare_category": challenge.healthcare_category,
        "compliance_required": challenge.compliance_required or [],
        "geography":           challenge.geography or [],
        "stage_required":      challenge.stage_required,
        "prize_value":         challenge.prize_value,
        "deadline":            challenge.deadline,
        "status":              "open",
        "application_count":   0,
    }

    result = db.table("challenges").insert(insert_data).execute()

    if result.data:
        return _row_to_challenge(result.data[0])

    raise HTTPException(status_code=500, detail="Failed to create challenge")


# ─── LIST CHALLENGES ──────────────────────────────────────────────────────────

@router.get("/", response_model=list[dict])
def list_challenges(
    status: Optional[str] = Query("open"),          # open|closed|all
    vertical: Optional[str] = Query(None),
    healthcare_category: Optional[str] = Query(None),
    compliance: Optional[str] = Query(None),         # comma-separated
    geography: Optional[str] = Query(None),           # comma-separated
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query("latest"),           # latest|deadline|prize
) -> list[dict]:
    """List challenges with optional filters. Anyone can browse."""
    db = get_db()

    query = db.table("challenges").select("*")

    if status and status != "all":
        query = query.eq("status", status)

    if vertical:
        query = query.eq("vertical", vertical.lower())

    if healthcare_category:
        query = query.eq("healthcare_category", healthcare_category)

    result = query.execute()
    data = result.data or []

    # Post-fetch filters (arrays)
    if compliance:
        comp_list = [c.strip().lower() for c in compliance.split(",")]
        data = [
            row for row in data
            if row.get("compliance_required") and
            any(c in [x.lower() for x in (row["compliance_required"] or [])] for c in comp_list)
        ]

    if geography:
        geo_list = [g.strip().lower() for g in geography.split(",")]
        data = [
            row for row in data
            if row.get("geography") and
            any(g in [x.lower() for x in (row["geography"] or [])] for g in geo_list)
        ]

    if search:
        term = search.lower()
        data = [
            row for row in data
            if term in (row.get("title") or "").lower()
            or term in (row.get("description") or "").lower()
        ]

    # Sorting
    if sort == "deadline":
        # sort ascending by deadline (soonest first), nulls last
        data.sort(key=lambda r: r.get("deadline") or "9999-12-31")
    elif sort == "prize":
        data.sort(key=lambda r: r.get("prize_value") or "", reverse=True)
    else:  # default: latest
        data.sort(key=lambda r: r.get("created_at") or "", reverse=True)

    return [_row_to_challenge(row) for row in data]


# ─── CHALLENGE DETAIL ─────────────────────────────────────────────────────────

@router.get("/{challenge_id}", response_model=dict)
def get_challenge(challenge_id: str) -> dict:
    """Get full challenge details."""
    db = get_db()
    result = db.table("challenges").select("*").eq("id", challenge_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Challenge not found")

    return _row_to_challenge(result.data[0])


# ─── APPLY TO CHALLENGE ───────────────────────────────────────────────────────

@router.post("/{challenge_id}/apply", response_model=dict)
def apply_to_challenge(
    challenge_id: str,
    application: ChallengeApplicationCreate,
    x_clerk_user_id: Optional[str] = Header(None),
) -> dict:
    """Startup user applies to an open challenge with one of their products."""
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    db = get_db()

    # Verify challenge exists and is open
    challenge_result = db.table("challenges").select("id, status").eq("id", challenge_id).execute()
    if not challenge_result.data:
        raise HTTPException(status_code=404, detail="Challenge not found")
    if challenge_result.data[0]["status"] != "open":
        raise HTTPException(status_code=400, detail="This challenge is no longer accepting applications")

    # Verify product belongs to applicant
    user_result = db.table("users").select("id").eq("clerk_id", x_clerk_user_id).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")

    user_db_id = user_result.data[0]["id"]
    product_result = db.table("products").select("id, name, user_id").eq("id", application.product_id).execute()
    if not product_result.data:
        raise HTTPException(status_code=404, detail="Product not found")

    product = product_result.data[0]
    if str(product.get("user_id")) != str(user_db_id):
        raise HTTPException(status_code=403, detail="You can only apply with your own products")

    # Check for duplicate application
    dupe_result = db.table("challenge_applications").select("id").eq("challenge_id", challenge_id).eq("product_id", application.product_id).execute()
    if dupe_result.data:
        raise HTTPException(status_code=409, detail="You have already applied with this product")

    # Insert application
    insert_data = {
        "challenge_id":         challenge_id,
        "product_id":           application.product_id,
        "product_name":         product["name"],
        "applicant_id":         x_clerk_user_id,
        "solution_description": application.solution_description,
        "status":               "pending",
    }

    app_result = db.table("challenge_applications").insert(insert_data).execute()

    if not app_result.data:
        raise HTTPException(status_code=500, detail="Failed to submit application")

    # Increment application_count on challenge
    db.table("challenges").update(
        {"application_count": challenge_result.data[0].get("application_count", 0) + 1}
    ).eq("id", challenge_id).execute()

    app = app_result.data[0]
    return {
        "id":                   str(app["id"]),
        "challenge_id":         str(app["challenge_id"]),
        "product_id":           app["product_id"],
        "product_name":         app.get("product_name"),
        "applicant_id":         app["applicant_id"],
        "solution_description": app.get("solution_description"),
        "status":               app["status"],
        "created_at":           str(app.get("created_at") or ""),
        "message":              "Application submitted successfully!",
    }


# ─── LIST APPLICATIONS (enterprise view) ──────────────────────────────────────

@router.get("/{challenge_id}/applications", response_model=list[dict])
def list_applications(
    challenge_id: str,
    x_clerk_user_id: Optional[str] = Header(None),
) -> list[dict]:
    """Enterprise owner views all applications for their challenge."""
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    db = get_db()

    # Verify requestor owns this challenge
    challenge_result = db.table("challenges").select("posted_by").eq("id", challenge_id).execute()
    if not challenge_result.data:
        raise HTTPException(status_code=404, detail="Challenge not found")

    if challenge_result.data[0]["posted_by"] != x_clerk_user_id:
        # Allow admin role to view any
        user_result = db.table("users").select("role").eq("clerk_id", x_clerk_user_id).execute()
        if not user_result.data or user_result.data[0].get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only the challenge owner can view applications")

    apps_result = db.table("challenge_applications").select("*").eq("challenge_id", challenge_id).order("created_at", desc=True).execute()
    apps = apps_result.data or []

    # Enrich with basic product data for display
    enriched = []
    for app in apps:
        # Get product trust score
        product_result = db.table("products").select("trust_score, website").eq("id", app["product_id"]).execute()
        product_extra = product_result.data[0] if product_result.data else {}
        enriched.append({
            "id":                   str(app["id"]),
            "challenge_id":         str(app["challenge_id"]),
            "product_id":           app["product_id"],
            "product_name":         app.get("product_name"),
            "product_trust_score":  product_extra.get("trust_score"),
            "product_website":      product_extra.get("website"),
            "applicant_id":         app["applicant_id"],
            "solution_description": app.get("solution_description"),
            "status":               app["status"],
            "created_at":           str(app.get("created_at") or ""),
        })

    return enriched


# ─── UPDATE APPLICATION STATUS (enterprise) ───────────────────────────────────

@router.patch("/{challenge_id}/applications/{app_id}", response_model=dict)
def update_application_status(
    challenge_id: str,
    app_id: str,
    update: ApplicationStatusUpdate,
    x_clerk_user_id: Optional[str] = Header(None),
) -> dict:
    """Enterprise shortlists, rejects, or selects winner for an application."""
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    if update.status not in ("pending", "shortlisted", "winner", "rejected"):
        raise HTTPException(status_code=400, detail="Invalid status. Must be: pending | shortlisted | winner | rejected")

    db = get_db()

    # Verify challenge ownership
    challenge_result = db.table("challenges").select("posted_by, status").eq("id", challenge_id).execute()
    if not challenge_result.data:
        raise HTTPException(status_code=404, detail="Challenge not found")
    if challenge_result.data[0]["posted_by"] != x_clerk_user_id:
        raise HTTPException(status_code=403, detail="Only the challenge owner can update applications")

    # Update application
    result = db.table("challenge_applications").update({"status": update.status}).eq("id", app_id).eq("challenge_id", challenge_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Application not found")

    # If winner selected, update challenge status
    if update.status == "winner":
        db.table("challenges").update({"status": "winner_selected"}).eq("id", challenge_id).execute()

    return {
        "success": True,
        "application_id": app_id,
        "new_status": update.status,
        "message": f"Application status updated to '{update.status}'"
    }


# ─── MY APPLICATIONS (startup view) ───────────────────────────────────────────

@router.get("/my/applications", response_model=list[dict])
def my_applications(
    x_clerk_user_id: Optional[str] = Header(None),
) -> list[dict]:
    """Startup user sees all challenges they have applied to."""
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    db = get_db()
    apps_result = db.table("challenge_applications").select("*").eq("applicant_id", x_clerk_user_id).order("created_at", desc=True).execute()
    apps = apps_result.data or []

    enriched = []
    for app in apps:
        challenge_result = db.table("challenges").select("title, status, deadline, posted_by_name").eq("id", str(app["challenge_id"])).execute()
        challenge_extra = challenge_result.data[0] if challenge_result.data else {}
        enriched.append({
            "id":                   str(app["id"]),
            "challenge_id":         str(app["challenge_id"]),
            "challenge_title":      challenge_extra.get("title"),
            "challenge_status":     challenge_extra.get("status"),
            "challenge_deadline":   challenge_extra.get("deadline"),
            "posted_by_name":       challenge_extra.get("posted_by_name"),
            "product_id":           app["product_id"],
            "product_name":         app.get("product_name"),
            "solution_description": app.get("solution_description"),
            "status":               app["status"],
            "created_at":           str(app.get("created_at") or ""),
        })

    return enriched
