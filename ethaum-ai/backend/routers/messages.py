"""EthAum AI — Messaging Router (Phase 4).

Endpoints:
  POST  /api/v1/messages              → send a message
  GET   /api/v1/messages/inbox        → list conversation threads
  GET   /api/v1/messages/{thread_id}  → get thread messages
  PATCH /api/v1/messages/{id}/read    → mark message as read

Thread ID convention:
  sorted([from_user, to_user]) joined by ':' + optional '#product_id'
  This makes threads deterministic and bidirectional.

Auth: X-Clerk-User-Id (all routes require it)
DB: supabase singleton
Email: fire-and-forget via services.notifications
"""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from database import get_db
from schemas.messaging import MessageCreate, MessageResponse, ConversationSummary
from services.notifications import notify_new_message
import threading

router = APIRouter()


# ─── HELPER ──────────────────────────────────────────────────────────────────

def _make_thread_id(user_a: str, user_b: str, product_id: Optional[int] = None) -> str:
    """Deterministic thread key — sorted so A↔B is the same as B↔A."""
    pair = ":".join(sorted([user_a, user_b]))
    return f"{pair}#{product_id}" if product_id else pair


def _row_to_message(row: dict) -> dict:
    return {
        "id":         str(row["id"]),
        "from_user":  row["from_user"],
        "to_user":    row["to_user"],
        "thread_id":  row["thread_id"],
        "product_id": row.get("product_id"),
        "content":    row["content"],
        "read":       row.get("read", False),
        "created_at": str(row["created_at"]) if row.get("created_at") else None,
    }


# ─── SEND MESSAGE ─────────────────────────────────────────────────────────────

@router.post("/", response_model=dict)
def send_message(
    msg: MessageCreate,
    x_clerk_user_id: Optional[str] = Header(None),
) -> dict:
    """Send a message to another user.

    Enterprise/Investor may initiate. Startup replies only within existing threads.
    """
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    if x_clerk_user_id == msg.to_user:
        raise HTTPException(status_code=400, detail="Cannot message yourself")
    if not msg.content or not msg.content.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty")
    if len(msg.content) > 4000:
        raise HTTPException(status_code=400, detail="Message too long (max 4000 chars)")

    db = get_db()

    # Resolve sender info
    sender_result = db.table("users").select("full_name, email, role_v2, role").eq("clerk_id", x_clerk_user_id).execute()
    if not sender_result.data:
        raise HTTPException(status_code=404, detail="Sender not found")
    sender = sender_result.data[0]
    sender_role_v2 = (sender.get("role_v2") or "").lower()
    sender_role    = (sender.get("role") or "").lower()

    # Build thread_id
    thread_id = _make_thread_id(x_clerk_user_id, msg.to_user, msg.product_id)

    # Startup can only REPLY inside existing thread (not initiate)
    if sender_role_v2 == "startup" or sender_role == "founder":
        existing = db.table("messages").select("id").eq("thread_id", thread_id).execute()
        if not existing.data:
            raise HTTPException(
                status_code=403,
                detail="Startup users cannot initiate a conversation. Wait for an enterprise or investor to contact you.",
            )

    insert = {
        "from_user":  x_clerk_user_id,
        "to_user":    msg.to_user,
        "thread_id":  thread_id,
        "product_id": msg.product_id,
        "content":    msg.content.strip(),
        "read":       False,
    }
    result = db.table("messages").insert(insert).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to send message")

    new_msg = result.data[0]

    # Fire-and-forget email to recipient
    recipient_result = db.table("users").select("email, full_name").eq("clerk_id", msg.to_user).execute()
    if recipient_result.data:
        rec = recipient_result.data[0]
        sender_name = sender.get("full_name") or "A user"
        def _send():
            notify_new_message(
                to_email=rec["email"],
                from_name=sender_name,
                preview=msg.content,
                thread_id=thread_id,
            )
        threading.Thread(target=_send, daemon=True).start()

    return _row_to_message(new_msg)


# ─── INBOX ────────────────────────────────────────────────────────────────────

@router.get("/inbox", response_model=list[dict])
def get_inbox(
    x_clerk_user_id: Optional[str] = Header(None),
) -> list[dict]:
    """Get the signed-in user's message threads (inbox + sent)."""
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    db = get_db()

    # Fetch all messages involving this user (sender or recipient)
    sent_result = db.table("messages").select("*").eq("from_user", x_clerk_user_id).execute()
    recv_result = db.table("messages").select("*").eq("to_user",   x_clerk_user_id).execute()
    all_msgs    = (sent_result.data or []) + (recv_result.data or [])

    # Group by thread_id — keep latest message per thread
    threads: dict[str, dict] = {}
    for m in all_msgs:
        tid = m["thread_id"]
        if tid not in threads or m["created_at"] > threads[tid]["created_at"]:
            threads[tid] = m

    if not threads:
        return []

    # Build conversation summaries
    convos = []
    for tid, last_msg in sorted(threads.items(), key=lambda x: x[1]["created_at"], reverse=True):
        other_id = last_msg["to_user"] if last_msg["from_user"] == x_clerk_user_id else last_msg["from_user"]

        # Unread count (messages to me that are unread)
        unread_count = sum(
            1 for m in all_msgs
            if m["thread_id"] == tid and m["to_user"] == x_clerk_user_id and not m.get("read")
        )

        # Resolve other user's name
        other_result = db.table("users").select("full_name, company_name").eq("clerk_id", other_id).execute()
        other_user   = other_result.data[0] if other_result.data else {}
        other_name   = other_user.get("company_name") or other_user.get("full_name") or "Unknown"

        # Resolve product name if present
        product_name = None
        if last_msg.get("product_id"):
            p_result = db.table("products").select("name").eq("id", last_msg["product_id"]).execute()
            if p_result.data:
                product_name = p_result.data[0]["name"]

        convos.append({
            "thread_id":       tid,
            "other_user_id":   other_id,
            "other_user_name": other_name,
            "product_id":      last_msg.get("product_id"),
            "product_name":    product_name,
            "last_message":    last_msg["content"][:120] + ("…" if len(last_msg["content"]) > 120 else ""),
            "last_message_at": str(last_msg.get("created_at") or ""),
            "unread_count":    unread_count,
        })

    return convos


# ─── GET THREAD ───────────────────────────────────────────────────────────────

@router.get("/{thread_id:path}", response_model=list[dict])
def get_thread(
    thread_id: str,
    x_clerk_user_id: Optional[str] = Header(None),
) -> list[dict]:
    """Get all messages in a specific thread (participant-only access)."""
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    db = get_db()

    result = db.table("messages").select("*").eq("thread_id", thread_id).order("created_at").execute()
    msgs   = result.data or []

    # Verify user is a participant
    participants = {m["from_user"] for m in msgs} | {m["to_user"] for m in msgs}
    if msgs and x_clerk_user_id not in participants:
        raise HTTPException(status_code=403, detail="Access denied")

    # Auto-mark delivered messages as read
    unread_ids = [m["id"] for m in msgs if m["to_user"] == x_clerk_user_id and not m.get("read")]
    if unread_ids:
        db.table("messages").update({"read": True}).in_("id", unread_ids).execute()

    return [_row_to_message(m) for m in msgs]


# ─── MARK READ ────────────────────────────────────────────────────────────────

@router.patch("/{message_id}/read", response_model=dict)
def mark_read(
    message_id: str,
    x_clerk_user_id: Optional[str] = Header(None),
) -> dict:
    """Mark a single message as read (recipient only)."""
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    db = get_db()
    result = db.table("messages").select("to_user").eq("id", message_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Message not found")
    if result.data[0]["to_user"] != x_clerk_user_id:
        raise HTTPException(status_code=403, detail="Can only mark your own messages as read")

    db.table("messages").update({"read": True}).eq("id", message_id).execute()
    return {"success": True, "message_id": message_id}
