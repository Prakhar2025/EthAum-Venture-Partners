"""EthAum AI — Resend Email Notification Service (Phase 4).

Provides fire-and-forget email helpers triggered by platform events:
  - New message received
  - New review received
  - New challenge application received
  - New launch upvote (milestone)
  - Welcome email on signup

RESEND_API_KEY must be set in backend/.env
FROM address must be a verified Resend domain sender.

Usage (from any router):
    from services.notifications import send_email, notify_new_message, ...
"""

import os
import logging
from typing import Optional

log = logging.getLogger(__name__)

# ── Resend initialisation ─────────────────────────────────────────────────────
# Import lazily so the server doesn't crash if resend isn't installed yet
try:
    import resend as resend_sdk
    _RESEND_AVAILABLE = True
except ImportError:
    _RESEND_AVAILABLE = False
    log.warning("resend package not installed. Email notifications disabled.")

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
FROM_EMAIL     = os.getenv("RESEND_FROM_EMAIL", "noreply@ethaumai.com")
APP_URL        = os.getenv("NEXT_PUBLIC_APP_URL", "https://ethaumai-v2.vercel.app")


def _resend_init() -> bool:
    """Initialise Resend API key on first use. Returns True if ready."""
    if not _RESEND_AVAILABLE:
        return False
    if not RESEND_API_KEY:
        log.warning("RESEND_API_KEY not set — skipping email")
        return False
    resend_sdk.api_key = RESEND_API_KEY
    return True


def send_email(to: str, subject: str, html: str) -> bool:
    """Low-level send. Returns True on success. Never raises."""
    if not to or "@" not in to:
        return False
    if not _resend_init():
        return False
    try:
        resend_sdk.Emails.send({
            "from":    FROM_EMAIL,
            "to":      to,
            "subject": subject,
            "html":    html,
        })
        log.info(f"Email sent → {to} | {subject}")
        return True
    except Exception as exc:
        log.warning(f"Email send failed → {to}: {exc}")
        return False


# ── Email templates ───────────────────────────────────────────────────────────

_BASE = """
<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#f8f9fc;border-radius:12px;">
  <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:10px;padding:24px;margin-bottom:24px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:22px;">EthAum AI</h1>
    <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Healthcare B2B Marketplace</p>
  </div>
  <div style="background:#fff;border-radius:10px;padding:28px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
    {body}
  </div>
  <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:20px;">
    You are receiving this because you are registered on <a href="{app_url}" style="color:#7c3aed;">EthAum AI</a>.
  </p>
</div>
"""

def _wrap(body: str) -> str:
    return _BASE.format(body=body, app_url=APP_URL)

def _btn(text: str, href: str) -> str:
    return f'<a href="{href}" style="display:inline-block;background:#7c3aed;color:#fff;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:16px;">{text}</a>'


# ── Notification helpers ──────────────────────────────────────────────────────

def notify_new_message(to_email: str, from_name: str, preview: str, thread_id: str) -> bool:
    """Notify inbox recipient of a new message."""
    body = f"""
    <h2 style="margin:0 0 8px;color:#111827;font-size:18px;">New message from {from_name}</h2>
    <p style="color:#374151;font-size:14px;background:#f3f4f6;border-radius:8px;padding:12px;font-style:italic;">
      &ldquo;{preview[:200]}{"…" if len(preview) > 200 else ""}&rdquo;
    </p>
    {_btn("Open Inbox", f"{APP_URL}/messages/{thread_id}")}
    """
    return send_email(to_email, f"New message from {from_name} • EthAum AI", _wrap(body))


def notify_new_review(to_email: str, product_name: str, rating: int, product_id: int) -> bool:
    """Notify startup founder of a new review."""
    stars = "⭐" * rating
    body = f"""
    <h2 style="margin:0 0 8px;color:#111827;font-size:18px;">New {stars} review for {product_name}</h2>
    <p style="color:#6b7280;font-size:14px;">Someone just left a review for your product. Check your trust score — it may have updated.</p>
    {_btn("View Reviews", f"{APP_URL}/product/{product_id}")}
    """
    return send_email(to_email, f"New review for {product_name} • EthAum AI", _wrap(body))


def notify_challenge_application(to_email: str, challenge_title: str, product_name: str, challenge_id: str) -> bool:
    """Notify enterprise of a new challenge application."""
    body = f"""
    <h2 style="margin:0 0 8px;color:#111827;font-size:18px;">New application for your challenge</h2>
    <p style="color:#374151;font-size:14px;margin-bottom:4px;">Challenge: <strong>{challenge_title}</strong></p>
    <p style="color:#374151;font-size:14px;">Startup: <strong>{product_name}</strong> has applied with a solution.</p>
    {_btn("Review Applications", f"{APP_URL}/challenges/{challenge_id}/applications")}
    """
    return send_email(to_email, f"New application: {challenge_title} • EthAum AI", _wrap(body))


def notify_pilot_request(to_email: str, product_name: str, company_name: str, deal_id: int) -> bool:
    """Notify startup of a new pilot request."""
    body = f"""
    <h2 style="margin:0 0 8px;color:#111827;font-size:18px;">Pilot request for {product_name}</h2>
    <p style="color:#374151;font-size:14px;"><strong>{company_name}</strong> has requested an enterprise pilot for your product. Follow up within 24 hours for best conversion.</p>
    {_btn("View Deal", f"{APP_URL}/deals")}
    """
    return send_email(to_email, f"Pilot request from {company_name} • EthAum AI", _wrap(body))


def notify_welcome(to_email: str, full_name: str) -> bool:
    """Welcome email on first signup."""
    first = full_name.split()[0] if full_name else "there"
    body = f"""
    <h2 style="margin:0 0 8px;color:#111827;font-size:18px;">Welcome to EthAum AI, {first}! 🎉</h2>
    <p style="color:#374151;font-size:14px;">You've joined the leading healthcare B2B marketplace connecting startups, enterprise buyers, and investors.</p>
    <ul style="color:#374151;font-size:14px;padding-left:20px;">
      <li>Browse verified healthcare startups on the <a href="{APP_URL}/marketplace" style="color:#7c3aed;">Marketplace</a></li>
      <li>Post or apply to <a href="{APP_URL}/challenges" style="color:#7c3aed;">Innovation Challenges</a></li>
      <li>Submit your startup for Trust Score verification</li>
    </ul>
    {_btn("Get Started →", APP_URL)}
    """
    return send_email(to_email, "Welcome to EthAum AI — Healthcare B2B Marketplace", _wrap(body))
