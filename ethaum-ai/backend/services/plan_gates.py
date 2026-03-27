"""EthAum AI — Plan Feature Gates (Phase 5).

Single source of truth for plan–feature mapping.
Import `require_feature` or `get_user_plan` from any router.

Plan hierarchy (additive):
    free < starter < growth  (startup-oriented plans)
    enterprise_buyer          (enterprise-specific)
    investor                  (investor-specific)
"""

import os
from typing import Optional
from fastapi import HTTPException
from database import get_db

# ─── PLAN PRICES (USD/month for display) ─────────────────────────────────────

PLAN_DISPLAY = {
    "free":             {"name": "Free",             "price_usd": 0,   "price_id": None},
    "starter":          {"name": "Starter",          "price_usd": 49,  "price_id": os.getenv("STRIPE_PRICE_STARTER",  "")},
    "growth":           {"name": "Growth",           "price_usd": 149, "price_id": os.getenv("STRIPE_PRICE_GROWTH",   "")},
    "enterprise_buyer": {"name": "Enterprise Buyer", "price_usd": 299, "price_id": os.getenv("STRIPE_PRICE_ENTERPRISE","")},
    "investor":         {"name": "Investor",         "price_usd": 99,  "price_id": os.getenv("STRIPE_PRICE_INVESTOR", "")},
}

# ─── FEATURE MAP ──────────────────────────────────────────────────────────────

# Each plan's feature set is additive — check helper resolves inheritance.
_DIRECT_FEATURES = {
    "free": {
        "basic_listing",
        "receive_reviews",
        "see_trust_score",
    },
    "starter": {
        "launch_product",
        "embed_badge",
        "list_deal_1",
    },
    "growth": {
        "unlimited_launches",
        "ai_sentiment",
        "quadrant",
        "reports",
        "matchmaking",
        "list_deals_3",
    },
    "enterprise_buyer": {
        "discovery",
        "ai_matching",
        "post_challenges",
        "messaging",
        "due_diligence",
    },
    "investor": {
        "discovery",
        "portfolio_tracking",
        "trend_data",
        "intro_requests",
    },
}

# Build cumulative sets for startup plans (free ⊂ starter ⊂ growth)
_RESOLVED: dict[str, set[str]] = {
    "free":             _DIRECT_FEATURES["free"].copy(),
    "starter":          _DIRECT_FEATURES["free"] | _DIRECT_FEATURES["starter"],
    "growth":           _DIRECT_FEATURES["free"] | _DIRECT_FEATURES["starter"] | _DIRECT_FEATURES["growth"],
    "enterprise_buyer": _DIRECT_FEATURES["enterprise_buyer"],
    "investor":         _DIRECT_FEATURES["investor"],
}


def check_feature(user_plan: str, feature: str) -> bool:
    """Return True if user_plan grants access to feature."""
    return feature in _RESOLVED.get(user_plan or "free", set())


def get_plan_features(plan: str) -> list[str]:
    """Return sorted list of all features for a given plan."""
    return sorted(_RESOLVED.get(plan, set()))


# ─── DB HELPER: get current user's active plan ───────────────────────────────

def get_user_plan(clerk_id: str) -> str:
    """Look up a user's active subscription plan from DB. Returns 'free' if none found."""
    try:
        db = get_db()
        result = (
            db.table("subscriptions")
            .select("plan, status")
            .eq("user_id", clerk_id)
            .execute()
        )
        if result.data:
            row = result.data[0]
            # Only honour active / trialing subs
            if row["status"] in ("active", "trialing"):
                return row["plan"]
    except Exception:
        pass
    return "free"


def require_feature(clerk_id: str, feature: str) -> str:
    """
    Raise HTTP 403 if user's plan does not include the requested feature.
    Returns the user's current plan on success.

    Usage in routers:
        plan = require_feature(user_id, "post_challenges")
    """
    plan = get_user_plan(clerk_id)
    if not check_feature(plan, feature):
        raise HTTPException(
            status_code=403,
            detail=f"Your plan ('{plan}') does not include '{feature}'. Upgrade at /pricing.",
        )
    return plan
