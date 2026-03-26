"""EthAum AI — Products Router V2 (Phase 2).

New features:
- GET /api/v1/products now accepts healthcare filter query params
- POST /api/v1/products persists all V2 fields
- PUT /{product_id} persists all V2 fields
- GET /{product_id} returns all V2 fields
V0 routes & behaviour PRESERVED.
"""

from fastapi import APIRouter, HTTPException, Header, Query
from typing import Optional, List
from database import get_db
from schemas.product import ProductCreate, ProductResponse

router = APIRouter()


# ─── HELPER ──────────────────────────────────────────────────────────────────

def _build_product_response(row: dict) -> ProductResponse:
    """Build a ProductResponse from a Supabase row, gracefully handling missing V2 columns."""
    return ProductResponse(
        id=row["id"],
        name=row["name"],
        website=row["website"],
        category=row["category"],
        funding_stage=row["funding_stage"],
        trust_score=row["trust_score"],
        description=row.get("description"),
        tagline=row.get("tagline"),
        user_id=str(row.get("user_id", "")) or None,
        # V2 fields
        vertical=row.get("vertical"),
        healthcare_category=row.get("healthcare_category"),
        compliance=row.get("compliance"),
        revenue_stage=row.get("revenue_stage"),
        geography=row.get("geography"),
        team_size=row.get("team_size"),
        total_funding=row.get("total_funding"),
        linkedin_url=row.get("linkedin_url"),
        pitch_deck_url=row.get("pitch_deck_url"),
        demo_video_url=row.get("demo_video_url"),
        integrations=row.get("integrations"),
    )


# ─── V0 COMPAT ›: ALL COLUMNS TO SELECT ──────────────────────────────────────

_SELECT_COLS = (
    "id, name, trust_score, category, funding_stage, website, description, tagline, user_id, status, "
    "vertical, healthcare_category, compliance, revenue_stage, geography, "
    "team_size, total_funding, linkedin_url, pitch_deck_url, demo_video_url, integrations"
)


# ─── CREATE PRODUCT ───────────────────────────────────────────────────────────

@router.post("/", response_model=ProductResponse)
def create_product(
    product: ProductCreate,
    x_clerk_user_id: Optional[str] = Header(None),
) -> ProductResponse:
    """Submit a new startup listing. Requires authentication."""
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required to submit a product")

    db = get_db()

    user_result = db.table("users").select("id, role").eq("clerk_id", x_clerk_user_id).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found. Please sign in again.")

    user = user_result.data[0]
    initial_score = 70

    insert_data = {
        "name": product.name,
        "website": product.website,
        "category": product.category,
        "funding_stage": product.funding_stage,
        "description": product.description,
        "tagline": product.tagline,
        "trust_score": initial_score,
        "data_integrity": 70,
        "market_traction": 70,
        "user_sentiment": 70,
        "user_id": user["id"],
        "status": "pending",
        # V2 healthcare fields
        "vertical": product.vertical,
        "healthcare_category": product.healthcare_category,
        "compliance": product.compliance or [],
        "revenue_stage": product.revenue_stage,
        "geography": product.geography or [],
        "team_size": product.team_size,
        "total_funding": product.total_funding,
        "linkedin_url": product.linkedin_url,
        "pitch_deck_url": product.pitch_deck_url,
        "demo_video_url": product.demo_video_url,
        "integrations": product.integrations or [],
    }

    result = db.table("products").insert(insert_data).execute()

    if result.data:
        return _build_product_response(result.data[0])

    raise HTTPException(status_code=500, detail="Failed to create product")


# ─── LIST PRODUCTS WITH FILTERS ───────────────────────────────────────────────

@router.get("/", response_model=list[dict])
def list_products(
    # Healthcare filters
    vertical: Optional[str] = Query(None),
    healthcare_category: Optional[str] = Query(None),
    compliance: Optional[str] = Query(None),          # comma-separated
    revenue_stage: Optional[str] = Query(None),        # comma-separated
    geography: Optional[str] = Query(None),             # comma-separated
    trust_score_min: Optional[int] = Query(None),
    # Generic
    search: Optional[str] = Query(None),
    sort: Optional[str] = Query("trust_score"),
) -> list[dict]:
    """
    List approved startups with optional healthcare filters.
    All params are optional — omitting them returns the full marketplace (V0 compatible).
    """
    db = get_db()
    query = db.table("products").select(_SELECT_COLS).eq("status", "approved")

    # Vertical filter
    if vertical:
        query = query.eq("vertical", vertical.lower())

    # Healthcare category filter
    if healthcare_category:
        query = query.eq("healthcare_category", healthcare_category)

    # Trust score minimum
    if trust_score_min is not None:
        query = query.gte("trust_score", trust_score_min)

    # Revenue stage filter (comma-separated → OR filter)
    # Applied post-fetch because Supabase Python SDK .in_() needs list
    result = query.execute()
    data = result.data if result.data else []

    # ── Post-fetch filters (array and multi-value) ────────────────────────────

    if compliance:
        compliance_list = [c.strip().lower() for c in compliance.split(",")]
        data = [
            p for p in data
            if p.get("compliance") and
            any(c in [x.lower() for x in (p["compliance"] or [])] for c in compliance_list)
        ]

    if revenue_stage:
        stage_list = [s.strip().lower() for s in revenue_stage.split(",")]
        data = [p for p in data if (p.get("revenue_stage") or "").lower() in stage_list]

    if geography:
        geo_list = [g.strip().lower() for g in geography.split(",")]
        data = [
            p for p in data
            if p.get("geography") and
            any(g in [x.lower() for x in (p["geography"] or [])] for g in geo_list)
        ]

    # Search filter (name + description)
    if search:
        term = search.lower()
        data = [
            p for p in data
            if term in (p.get("name") or "").lower()
            or term in (p.get("description") or "").lower()
        ]

    # Sorting
    if sort == "latest":
        data.sort(key=lambda p: p.get("id", 0), reverse=True)
    elif sort == "name":
        data.sort(key=lambda p: (p.get("name") or "").lower())
    else:  # default: trust_score
        data.sort(key=lambda p: p.get("trust_score", 0), reverse=True)

    return data


# ─── MY PRODUCTS ─────────────────────────────────────────────────────────────

@router.get("/my-products")
def get_my_products(x_clerk_user_id: Optional[str] = Header(None)) -> list[dict]:
    """Get products submitted by the current user."""
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    db = get_db()
    user_result = db.table("users").select("id").eq("clerk_id", x_clerk_user_id).execute()
    if not user_result.data:
        return []

    user_id = user_result.data[0]["id"]
    result = db.table("products").select(_SELECT_COLS).eq("user_id", user_id).execute()
    return result.data if result.data else []


# ─── GET PRODUCT DETAIL ───────────────────────────────────────────────────────

@router.get("/{product_id}")
def get_product(product_id: int) -> dict:
    """Get startup details with trust score breakdown and V2 fields."""
    db = get_db()
    product_result = db.table("products").select("*").eq("id", product_id).execute()

    if not product_result.data:
        raise HTTPException(status_code=404, detail="Product not found")

    product = product_result.data[0]

    owner_info = None
    if product.get("user_id"):
        owner_result = db.table("users").select("full_name, email").eq("id", product["user_id"]).execute()
        if owner_result.data:
            owner_info = owner_result.data[0]

    launch_result = db.table("launches").select("*").eq("product_id", product_id).execute()
    launch_data = launch_result.data[0] if launch_result.data else {
        "upvotes": 0, "rank": 0, "is_featured": False
    }

    reviews_result = db.table("reviews").select("id").eq("product_id", product_id).execute()
    reviews_count = len(reviews_result.data) if reviews_result.data else 0

    return {
        # V0 fields
        "id": product["id"],
        "name": product["name"],
        "website": product["website"],
        "category": product["category"],
        "funding_stage": product["funding_stage"],
        "description": product.get("description"),
        "trust_score": product["trust_score"],
        "score_breakdown": {
            "data_integrity": product.get("data_integrity", 70),
            "market_traction": product.get("market_traction", 70),
            "user_sentiment": product.get("user_sentiment", 70),
        },
        "launch": {
            "is_launched": True,
            "upvotes": launch_data.get("upvotes", 0),
            "rank": launch_data.get("rank", 0),
        },
        "reviews_count": reviews_count,
        "owner": owner_info,
        # V2 healthcare fields
        "vertical": product.get("vertical"),
        "healthcare_category": product.get("healthcare_category"),
        "compliance": product.get("compliance") or [],
        "revenue_stage": product.get("revenue_stage"),
        "geography": product.get("geography") or [],
        "team_size": product.get("team_size"),
        "total_funding": product.get("total_funding"),
        "linkedin_url": product.get("linkedin_url"),
        "pitch_deck_url": product.get("pitch_deck_url"),
        "demo_video_url": product.get("demo_video_url"),
        "integrations": product.get("integrations") or [],
    }


# ─── UPDATE PRODUCT ───────────────────────────────────────────────────────────

@router.put("/{product_id}")
def update_product(
    product_id: int,
    product: ProductCreate,
    x_clerk_user_id: Optional[str] = Header(None),
) -> dict:
    """Update a product (only owner can update). Persists V2 fields."""
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    db = get_db()
    user_result = db.table("users").select("id").eq("clerk_id", x_clerk_user_id).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")

    user_id = user_result.data[0]["id"]
    product_result = db.table("products").select("user_id").eq("id", product_id).execute()
    if not product_result.data:
        raise HTTPException(status_code=404, detail="Product not found")

    if str(product_result.data[0].get("user_id")) != str(user_id):
        raise HTTPException(status_code=403, detail="You can only edit your own products")

    update_data = {
        "name": product.name,
        "website": product.website,
        "category": product.category,
        "funding_stage": product.funding_stage,
        "description": product.description,
        "vertical": product.vertical,
        "healthcare_category": product.healthcare_category,
        "compliance": product.compliance or [],
        "revenue_stage": product.revenue_stage,
        "geography": product.geography or [],
        "team_size": product.team_size,
        "total_funding": product.total_funding,
        "linkedin_url": product.linkedin_url,
        "pitch_deck_url": product.pitch_deck_url,
        "demo_video_url": product.demo_video_url,
        "integrations": product.integrations or [],
    }

    result = db.table("products").update(update_data).eq("id", product_id).execute()
    if result.data:
        return {"success": True, "message": "Product updated successfully"}

    raise HTTPException(status_code=500, detail="Failed to update product")


# ─── TRUST SCORE ONLY ─────────────────────────────────────────────────────────

@router.get("/{product_id}/score")
def get_product_score(product_id: int) -> dict:
    """Get only the trust score for a startup (V0 compat)."""
    db = get_db()
    result = db.table("products").select("trust_score").eq("id", product_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"trust_score": result.data[0]["trust_score"]}
