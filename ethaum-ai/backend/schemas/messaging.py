"""EthAum AI — Messaging + Watchlist Schemas (Phase 4)."""

from pydantic import BaseModel
from typing import Optional, List


# ─── MESSAGES ─────────────────────────────────────────────────────────────────

class MessageCreate(BaseModel):
    """Payload for sending a message."""
    to_user: str                     # clerk_id of recipient
    content: str
    product_id: Optional[int] = None  # INT — products.id SERIAL


class MessageResponse(BaseModel):
    id: str
    from_user: str
    to_user: str
    thread_id: str
    product_id: Optional[int] = None
    content: str
    read: bool = False
    created_at: Optional[str] = None


class ConversationSummary(BaseModel):
    """Inbox row — one entry per unique thread."""
    thread_id: str
    other_user_id: str                # clerk_id of the other participant
    other_user_name: Optional[str] = None
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    last_message: str
    last_message_at: Optional[str] = None
    unread_count: int = 0


# ─── WATCHLIST ────────────────────────────────────────────────────────────────

class WatchlistItem(BaseModel):
    id: str
    user_id: str
    product_id: int                   # INT — products.id SERIAL
    product_name: Optional[str] = None
    product_category: Optional[str] = None
    product_trust_score: Optional[int] = None
    product_website: Optional[str] = None
    product_vertical: Optional[str] = None
    product_healthcare_category: Optional[str] = None
    created_at: Optional[str] = None
