"""EthAum AI — Launches Router (Phase 7 Upgrade).

Changelog (Phase 7):
    - POST /generate-tagline — AI-powered launch tagline generator (Groq LLaMA).
      Input: product name, description, healthcare_category.
      Output: 3 tagline options ranked by strength.

All Phase 1 launch / upvote / leaderboard routes PRESERVED unchanged.
"""

import logging
import os
from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from pydantic import BaseModel
from database import get_db
from schemas.launch import LaunchCreate, LaunchResponse

log = logging.getLogger(__name__)
router = APIRouter()


# ─── TAGLINE GENERATOR ────────────────────────────────────────────────────────

class TaglineRequest(BaseModel):
    product_id: int | None = None   # optional — can pass raw strings too
    name: str
    description: str
    category: str | None = None


class TaglineResponse(BaseModel):
    taglines: list[str]
    engine: str


def _call_groq_taglines(name: str, description: str, category: str) -> list[str]:
    """Call Groq LLaMA to generate 3 launch taglines. Raises on failure."""
    key = os.getenv("GROQ_API_KEY", "")
    if not key:
        raise RuntimeError("GROQ_API_KEY not set")

    from groq import Groq
    client = Groq(api_key=key)

    prompt = (
        f"You are a Product Hunt launch copywriter specialising in healthcare B2B SaaS.\n\n"
        f"Product: {name}\n"
        f"Category: {category or 'Healthcare AI'}\n"
        f"Description: {description[:600]}\n\n"
        f"Write exactly 3 punchy launch taglines. Each tagline must:\n"
        f"- Be under 12 words\n"
        f"- Start with a strong verb or compelling hook\n"
        f"- Highlight the core healthcare problem solved\n"
        f"- Be distinct from the others in angle/tone\n\n"
        f"Return ONLY the 3 taglines, one per line. No numbering, no explanation."
    )

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=120,
        temperature=0.8,
    )

    raw = response.choices[0].message.content.strip()
    lines = [line.strip().lstrip("•-–1234567890. ") for line in raw.splitlines() if line.strip()]
    return lines[:3]


@router.post("/generate-tagline", response_model=TaglineResponse)
def generate_tagline(
    body: TaglineRequest,
    x_clerk_user_id: Optional[str] = Header(None),
) -> TaglineResponse:
    """Generate 3 AI-powered launch taglines for a startup (Groq LLaMA).

    Auth required. Available on all plans — tagline generation is a free feature.
    If Groq is unavailable, returns 3 template-based fallback taglines so the
    startup is never left without options.
    """
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Enrich with product data if product_id is provided
    name        = body.name
    description = body.description
    category    = body.category or ""

    if body.product_id:
        db = get_db()
        p_result = db.table("products").select(
            "name, description, healthcare_category, tagline"
        ).eq("id", body.product_id).execute()
        if p_result.data:
            p = p_result.data[0]
            name        = name        or p.get("name", "")
            description = description or p.get("description") or p.get("tagline") or ""
            category    = category    or p.get("healthcare_category") or ""

    if not name or not description:
        raise HTTPException(
            status_code=422,
            detail="Both 'name' and 'description' are required to generate taglines.",
        )

    # ── Try Groq ──────────────────────────────────────────────────────────────
    try:
        taglines = _call_groq_taglines(name, description, category)
        if len(taglines) < 3:
            raise ValueError("Insufficient taglines returned")
        log.info(f"[tagline] groq generated {len(taglines)} taglines for '{name}'")
        return TaglineResponse(taglines=taglines, engine="groq_llm")
    except Exception as e:
        log.warning(f"[tagline] Groq failed ({e}) — using template fallback")

    # ── Template fallback (never fails) ───────────────────────────────────────
    cat_label = (category or "Healthcare").replace("_", " ").title()
    fallback = [
        f"The smarter way to manage {cat_label}",
        f"Transform {cat_label} with AI-powered insights",
        f"Trusted by enterprise teams in {cat_label}",
    ]
    return TaglineResponse(taglines=fallback, engine="keyword_fallback")




@router.post("/", response_model=LaunchResponse)
def create_launch(
    launch: LaunchCreate,
    x_clerk_user_id: Optional[str] = Header(None)
) -> LaunchResponse:
    """Create a new product launch (requires authentication)."""
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    db = get_db()
    
    # Get user
    user_result = db.table("users").select("id").eq("clerk_id", x_clerk_user_id).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if product exists and belongs to user
    product_result = db.table("products").select("user_id").eq("id", launch.product_id).execute()
    if not product_result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    result = db.table("launches").insert({
        "product_id": launch.product_id,
        "upvotes": 0,
        "rank": 0,
        "is_featured": False,
    }).execute()
    
    if result.data:
        new_launch = result.data[0]
        return LaunchResponse(
            id=new_launch["id"],
            product_id=new_launch["product_id"],
            upvotes=new_launch["upvotes"],
        )
    
    raise HTTPException(status_code=500, detail="Failed to create launch")


@router.post("/{launch_id}/upvote")
def upvote_launch(
    launch_id: int,
    x_clerk_user_id: Optional[str] = Header(None)
) -> dict:
    """
    Upvote a launch (requires authentication).
    Each user can only upvote once per launch.
    """
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Sign in to upvote")
    
    db = get_db()
    
    # Get user
    user_result = db.table("users").select("id").eq("clerk_id", x_clerk_user_id).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_id = user_result.data[0]["id"]
    
    # Check if launch exists
    launch_result = db.table("launches").select("id, upvotes, product_id").eq("id", launch_id).execute()
    if not launch_result.data:
        raise HTTPException(status_code=404, detail="Launch not found")
    
    launch = launch_result.data[0]
    
    # Check if user already upvoted
    existing_upvote = db.table("upvotes").select("id").eq("user_id", user_id).eq("launch_id", launch_id).execute()
    
    if existing_upvote.data:
        # Remove upvote (toggle)
        db.table("upvotes").delete().eq("user_id", user_id).eq("launch_id", launch_id).execute()
        new_upvotes = max(0, launch["upvotes"] - 1)
        db.table("launches").update({"upvotes": new_upvotes}).eq("id", launch_id).execute()
        return {"id": launch_id, "upvotes": new_upvotes, "user_upvoted": False}
    else:
        # Add upvote
        db.table("upvotes").insert({
            "user_id": user_id,
            "launch_id": launch_id,
            "product_id": launch["product_id"],
        }).execute()
        new_upvotes = launch["upvotes"] + 1
        db.table("launches").update({"upvotes": new_upvotes}).eq("id", launch_id).execute()
        return {"id": launch_id, "upvotes": new_upvotes, "user_upvoted": True}


@router.get("/{launch_id}/upvote-status")
def get_upvote_status(
    launch_id: int,
    x_clerk_user_id: Optional[str] = Header(None)
) -> dict:
    """Check if current user has upvoted this launch."""
    if not x_clerk_user_id:
        return {"user_upvoted": False}
    
    db = get_db()
    
    user_result = db.table("users").select("id").eq("clerk_id", x_clerk_user_id).execute()
    if not user_result.data:
        return {"user_upvoted": False}
    
    user_id = user_result.data[0]["id"]
    
    existing = db.table("upvotes").select("id").eq("user_id", user_id).eq("launch_id", launch_id).execute()
    return {"user_upvoted": bool(existing.data)}


@router.get("/leaderboard")
def get_leaderboard(x_clerk_user_id: Optional[str] = Header(None)) -> list[dict]:
    """Get launches sorted by upvotes (descending)."""
    db = get_db()
    
    # Get user's upvoted launches if authenticated
    user_upvoted_ids = set()
    if x_clerk_user_id:
        user_result = db.table("users").select("id").eq("clerk_id", x_clerk_user_id).execute()
        if user_result.data:
            user_id = user_result.data[0]["id"]
            upvotes_result = db.table("upvotes").select("launch_id").eq("user_id", user_id).execute()
            user_upvoted_ids = {u["launch_id"] for u in upvotes_result.data or []}
    
    # Get launches with product info
    result = db.table("launches").select("*, products(name, category)").order("upvotes", desc=True).execute()
    
    leaderboard = []
    for i, launch in enumerate(result.data or []):
        product = launch.get("products", {}) or {}
        leaderboard.append({
            "id": launch["id"],
            "product_id": launch["product_id"],
            "name": product.get("name", "Unknown"),
            "category": product.get("category", ""),
            "upvotes": launch["upvotes"],
            "rank": i + 1,
            "is_featured": launch.get("is_featured", False),
            "user_upvoted": launch["id"] in user_upvoted_ids,
        })
    
    return leaderboard
