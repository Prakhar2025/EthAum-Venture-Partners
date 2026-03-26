"""EthAum AI — Watchlist Router (Phase 4).

Endpoints:
  GET    /api/v1/watchlist        → get user's saved startups
  POST   /api/v1/watchlist        → save a startup
  DELETE /api/v1/watchlist/{product_id} → remove from watchlist

Auth: X-Clerk-User-Id (all routes require it)
"""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from database import get_db
from pydantic import BaseModel

router = APIRouter()


class WatchlistAdd(BaseModel):
    product_id: int   # INTEGER — products.id SERIAL


@router.get("/", response_model=list[dict])
def get_watchlist(
    x_clerk_user_id: Optional[str] = Header(None),
) -> list[dict]:
    """Get the signed-in user's watchlist with enriched product data."""
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    db = get_db()
    result = db.table("watchlist").select("*").eq("user_id", x_clerk_user_id).order("created_at", desc=True).execute()
    items  = result.data or []

    enriched = []
    for item in items:
        p_result = db.table("products").select(
            "id, name, category, trust_score, website, vertical, healthcare_category, compliance"
        ).eq("id", item["product_id"]).execute()
        product = p_result.data[0] if p_result.data else {}

        enriched.append({
            "id":                          str(item["id"]),
            "user_id":                     item["user_id"],
            "product_id":                  item["product_id"],
            "product_name":                product.get("name"),
            "product_category":            product.get("category"),
            "product_trust_score":         product.get("trust_score"),
            "product_website":             product.get("website"),
            "product_vertical":            product.get("vertical"),
            "product_healthcare_category": product.get("healthcare_category"),
            "product_compliance":          product.get("compliance") or [],
            "created_at":                  str(item.get("created_at") or ""),
        })

    return enriched


@router.post("/", response_model=dict)
def add_to_watchlist(
    body: WatchlistAdd,
    x_clerk_user_id: Optional[str] = Header(None),
) -> dict:
    """Save a startup to the user's watchlist."""
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    db = get_db()

    # Verify product exists
    p_check = db.table("products").select("id, name").eq("id", body.product_id).execute()
    if not p_check.data:
        raise HTTPException(status_code=404, detail="Product not found")

    # Upsert (handles duplicate gracefully)
    try:
        result = db.table("watchlist").insert({
            "user_id":    x_clerk_user_id,
            "product_id": body.product_id,
        }).execute()
    except Exception:
        # Already saved — idempotent
        return {"success": True, "product_id": body.product_id, "message": "Already in watchlist"}

    return {
        "success":    True,
        "product_id": body.product_id,
        "product_name": p_check.data[0]["name"],
        "message":    "Added to watchlist",
    }


@router.delete("/{product_id}", response_model=dict)
def remove_from_watchlist(
    product_id: int,
    x_clerk_user_id: Optional[str] = Header(None),
) -> dict:
    """Remove a startup from the user's watchlist."""
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    db = get_db()
    db.table("watchlist").delete().eq("user_id", x_clerk_user_id).eq("product_id", product_id).execute()
    return {"success": True, "product_id": product_id, "message": "Removed from watchlist"}


@router.get("/check/{product_id}", response_model=dict)
def check_watchlist(
    product_id: int,
    x_clerk_user_id: Optional[str] = Header(None),
) -> dict:
    """Check if a product is in the user's watchlist (used by product cards)."""
    if not x_clerk_user_id:
        return {"saved": False}

    db = get_db()
    result = db.table("watchlist").select("id").eq("user_id", x_clerk_user_id).eq("product_id", product_id).execute()
    return {"saved": bool(result.data), "product_id": product_id}
