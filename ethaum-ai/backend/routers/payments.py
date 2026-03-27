"""EthAum AI — Payments Router (Phase 5).

Handles Stripe Checkout, Webhooks, Subscription retrieval, and Cancellation.

Environment variables required (Render):
    STRIPE_SECRET_KEY          → sk_live_... / sk_test_...
    STRIPE_WEBHOOK_SECRET      → whsec_...
    STRIPE_PRICE_STARTER       → price_...
    STRIPE_PRICE_GROWTH        → price_...
    STRIPE_PRICE_ENTERPRISE    → price_...
    STRIPE_PRICE_INVESTOR      → price_...
    NEXT_PUBLIC_APP_URL        → https://ethaumai-v2.vercel.app

Endpoints:
    POST /api/v1/payments/create-checkout → returns Stripe Checkout URL
    POST /api/v1/payments/webhook         → Stripe webhook handler (raw body)
    GET  /api/v1/payments/subscription    → current user's active plan
    POST /api/v1/payments/cancel          → schedule subscription cancellation

Auth: X-Clerk-User-Id on all routes EXCEPT /webhook
"""

import os
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Header, Request
from database import get_db
from schemas.payment import CheckoutRequest, SubscriptionResponse
from services.plan_gates import PLAN_DISPLAY

log = logging.getLogger(__name__)

router = APIRouter()

APP_URL = os.getenv("NEXT_PUBLIC_APP_URL", "https://ethaumai-v2.vercel.app")

# ─── Lazy Stripe init ─────────────────────────────────────────────────────────

def _stripe():
    try:
        import stripe as _s
        _s.api_key = os.getenv("STRIPE_SECRET_KEY", "")
        if not _s.api_key:
            raise ValueError("STRIPE_SECRET_KEY not set")
        return _s
    except ImportError:
        raise HTTPException(status_code=503, detail="Stripe SDK not installed. Run: pip install stripe")


# ─── HELPERS ─────────────────────────────────────────────────────────────────

def _get_or_create_customer(stripe, clerk_id: str, email: str) -> str:
    """Return existing Stripe customer_id or create a new one."""
    db = get_db()
    result = db.table("subscriptions").select("stripe_customer_id").eq("user_id", clerk_id).execute()
    if result.data and result.data[0].get("stripe_customer_id"):
        return result.data[0]["stripe_customer_id"]

    customer = stripe.Customer.create(
        email=email,
        metadata={"clerk_id": clerk_id},
    )
    return customer["id"]


def _upsert_subscription(user_id: str, data: dict):
    db = get_db()
    existing = db.table("subscriptions").select("id").eq("user_id", user_id).execute()
    if existing.data:
        db.table("subscriptions").update(data).eq("user_id", user_id).execute()
    else:
        db.table("subscriptions").insert({"user_id": user_id, **data}).execute()


# ─── CREATE CHECKOUT SESSION ──────────────────────────────────────────────────

@router.post("/create-checkout", response_model=dict)
def create_checkout(
    body: CheckoutRequest,
    x_clerk_user_id: Optional[str] = Header(None),
) -> dict:
    """Create a Stripe Checkout Session for the selected plan.
    Returns {checkout_url: str}.
    """
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    plan = body.plan.lower()
    if plan not in PLAN_DISPLAY or plan == "free":
        raise HTTPException(status_code=400, detail=f"Invalid plan: '{plan}'. Choose: starter, growth, enterprise_buyer, investor")

    price_id = PLAN_DISPLAY[plan]["price_id"]
    if not price_id:
        raise HTTPException(
            status_code=503,
            detail=f"Stripe price ID for '{plan}' not configured. Set STRIPE_PRICE_{plan.upper()} in environment.",
        )

    stripe = _stripe()
    db = get_db()

    # Get user email
    user_result = db.table("users").select("email, full_name").eq("clerk_id", x_clerk_user_id).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    user = user_result.data[0]

    customer_id = _get_or_create_customer(stripe, x_clerk_user_id, user["email"])

    success_url = body.success_url or f"{APP_URL}/pricing?success=1&plan={plan}"
    cancel_url  = body.cancel_url  or f"{APP_URL}/pricing?canceled=1"

    try:
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={"clerk_id": x_clerk_user_id, "plan": plan},
            subscription_data={"metadata": {"clerk_id": x_clerk_user_id, "plan": plan}},
        )
    except Exception as e:
        log.error(f"Stripe checkout error: {e}")
        raise HTTPException(status_code=502, detail=f"Stripe error: {str(e)}")

    return {"checkout_url": session.url, "session_id": session.id}


# ─── WEBHOOK ─────────────────────────────────────────────────────────────────

@router.post("/webhook")
async def stripe_webhook(request: Request) -> dict:
    """Handle Stripe webhook events. Raw body required — no auth header needed."""
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    stripe = _stripe()

    payload   = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        if webhook_secret:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        else:
            import json
            event = json.loads(payload)
            log.warning("STRIPE_WEBHOOK_SECRET not set — skipping signature verification")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook signature invalid: {e}")

    event_type = event["type"]
    log.info(f"Stripe webhook: {event_type}")

    # ── Checkout completed → activate subscription ────────────────────────────
    if event_type == "checkout.session.completed":
        session  = event["data"]["object"]
        clerk_id = session.get("metadata", {}).get("clerk_id")
        plan     = session.get("metadata", {}).get("plan", "free")
        sub_id   = session.get("subscription")
        cust_id  = session.get("customer")

        if clerk_id:
            # Fetch full subscription object for period dates
            period_end = None
            try:
                sub = stripe.Subscription.retrieve(sub_id)
                period_end = sub["current_period_end"]
            except Exception:
                pass

            _upsert_subscription(clerk_id, {
                "stripe_customer_id":     cust_id,
                "stripe_subscription_id": sub_id,
                "stripe_price_id":        PLAN_DISPLAY.get(plan, {}).get("price_id"),
                "plan":                   plan,
                "status":                 "active",
                "current_period_end":     (
                    str(period_end) if period_end else None
                ),
                "cancel_at_period_end":   False,
            })

    # ── Subscription updated (plan change / renewal) ──────────────────────────
    elif event_type in ("customer.subscription.updated", "customer.subscription.deleted"):
        sub      = event["data"]["object"]
        cust_id  = sub.get("customer")

        # Map customer → clerk_id
        db = get_db()
        result = db.table("subscriptions").select("user_id").eq("stripe_customer_id", cust_id).execute()
        if result.data:
            clerk_id = result.data[0]["user_id"]
            new_status = sub.get("status", "active")
            plan_price  = sub.get("items", {}).get("data", [{}])[0].get("price", {}).get("id", "")
            # Reverse-map price_id → plan slug
            plan_slug = next(
                (k for k, v in PLAN_DISPLAY.items() if v.get("price_id") == plan_price),
                "free",
            )
            if event_type == "customer.subscription.deleted":
                plan_slug = "free"
                new_status = "canceled"

            _upsert_subscription(clerk_id, {
                "stripe_subscription_id": sub.get("id"),
                "plan":                   plan_slug,
                "status":                 new_status,
                "cancel_at_period_end":   sub.get("cancel_at_period_end", False),
                "current_period_end":     str(sub.get("current_period_end") or ""),
            })

    # ── Payment failed ────────────────────────────────────────────────────────
    elif event_type == "invoice.payment_failed":
        invoice = event["data"]["object"]
        cust_id = invoice.get("customer")
        db = get_db()
        result = db.table("subscriptions").select("user_id").eq("stripe_customer_id", cust_id).execute()
        if result.data:
            db.table("subscriptions").update({"status": "past_due"}).eq("stripe_customer_id", cust_id).execute()

    return {"received": True}


# ─── GET SUBSCRIPTION ────────────────────────────────────────────────────────

@router.get("/subscription", response_model=dict)
def get_subscription(
    x_clerk_user_id: Optional[str] = Header(None),
) -> dict:
    """Return the signed-in user's current plan + subscription details."""
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    db = get_db()
    result = db.table("subscriptions").select("*").eq("user_id", x_clerk_user_id).execute()

    if not result.data:
        return {
            "plan": "free",
            "status": "active",
            "current_period_end": None,
            "cancel_at_period_end": False,
            "stripe_subscription_id": None,
        }

    row = result.data[0]
    return {
        "plan":                   row.get("plan", "free"),
        "status":                 row.get("status", "active"),
        "current_period_end":     str(row["current_period_end"]) if row.get("current_period_end") else None,
        "cancel_at_period_end":   row.get("cancel_at_period_end", False),
        "stripe_subscription_id": row.get("stripe_subscription_id"),
    }


# ─── CANCEL SUBSCRIPTION ─────────────────────────────────────────────────────

@router.post("/cancel", response_model=dict)
def cancel_subscription(
    x_clerk_user_id: Optional[str] = Header(None),
) -> dict:
    """Schedule subscription cancellation at end of current billing period."""
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    db = get_db()
    result = db.table("subscriptions").select("stripe_subscription_id, plan").eq("user_id", x_clerk_user_id).execute()

    if not result.data or result.data[0].get("plan") == "free":
        raise HTTPException(status_code=400, detail="No active paid subscription found")

    sub_id = result.data[0].get("stripe_subscription_id")
    if not sub_id:
        raise HTTPException(status_code=400, detail="No Stripe subscription ID on record")

    stripe = _stripe()
    try:
        stripe.Subscription.modify(sub_id, cancel_at_period_end=True)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Stripe error: {str(e)}")

    db.table("subscriptions").update({"cancel_at_period_end": True}).eq("user_id", x_clerk_user_id).execute()

    return {"success": True, "message": "Subscription will cancel at end of billing period"}


# ─── PLAN INFO (public) ───────────────────────────────────────────────────────

@router.get("/plans", response_model=list[dict])
def get_plans() -> list[dict]:
    """Return all plan definitions for the /pricing page (public)."""
    return [
        {
            "slug":      slug,
            "name":      meta["name"],
            "price_usd": meta["price_usd"],
        }
        for slug, meta in PLAN_DISPLAY.items()
    ]
