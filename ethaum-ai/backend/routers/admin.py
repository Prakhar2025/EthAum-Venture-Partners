"""EthAum AI - Admin Router with Role-Based Access Control.

Secure admin endpoints for managing products, users, and reviews.
All endpoints require admin role verification.
"""

from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from database import get_db

router = APIRouter()


def verify_admin(clerk_user_id: str) -> dict:
    """Verify that the user has admin role. Returns user data or raises 403."""
    if not clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    db = get_db()
    user_result = db.table("users").select("id, role, email, full_name").eq("clerk_id", clerk_user_id).execute()
    
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = user_result.data[0]
    
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return user


# ========== DASHBOARD STATS ==========

@router.get("/stats")
def get_admin_stats(x_clerk_user_id: Optional[str] = Header(None)) -> dict:
    """Get dashboard statistics for admin."""
    verify_admin(x_clerk_user_id)
    
    db = get_db()
    
    # Get counts
    products = db.table("products").select("id", count="exact").execute()
    users = db.table("users").select("id", count="exact").execute()
    reviews = db.table("reviews").select("id", count="exact").execute()
    launches = db.table("launches").select("id, upvotes").execute()
    
    # Calculate totals
    total_upvotes = sum(l.get("upvotes", 0) for l in (launches.data or []))
    
    # Get pending products count
    pending = db.table("products").select("id", count="exact").eq("status", "pending").execute()
    
    return {
        "total_products": products.count or 0,
        "total_users": users.count or 0,
        "total_reviews": reviews.count or 0,
        "total_upvotes": total_upvotes,
        "pending_products": pending.count or 0,
    }


# ========== PRODUCT MANAGEMENT ==========

@router.get("/products")
def get_all_products_admin(
    x_clerk_user_id: Optional[str] = Header(None),
    status: Optional[str] = None
) -> list[dict]:
    """Get all products for admin with optional status filter."""
    verify_admin(x_clerk_user_id)
    
    db = get_db()
    
    query = db.table("products").select(
        "id, name, category, trust_score, status, created_at, user_id"
    ).order("created_at", desc=True)
    
    if status:
        query = query.eq("status", status)
    
    result = query.execute()
    
    return result.data or []


@router.post("/products/{product_id}/approve")
def approve_product(
    product_id: int,
    x_clerk_user_id: Optional[str] = Header(None)
) -> dict:
    """Approve a pending product."""
    admin = verify_admin(x_clerk_user_id)
    
    db = get_db()
    
    result = db.table("products").update({
        "status": "approved"
    }).eq("id", product_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"success": True, "message": f"Product {product_id} approved", "admin": admin["email"]}


@router.post("/products/{product_id}/reject")
def reject_product(
    product_id: int,
    x_clerk_user_id: Optional[str] = Header(None)
) -> dict:
    """Reject a product."""
    admin = verify_admin(x_clerk_user_id)
    
    db = get_db()
    
    result = db.table("products").update({
        "status": "rejected"
    }).eq("id", product_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"success": True, "message": f"Product {product_id} rejected", "admin": admin["email"]}


@router.delete("/products/{product_id}")
def delete_product_admin(
    product_id: int,
    x_clerk_user_id: Optional[str] = Header(None)
) -> dict:
    """Permanently delete a product (admin only)."""
    admin = verify_admin(x_clerk_user_id)
    
    db = get_db()
    
    # Delete related data first
    db.table("reviews").delete().eq("product_id", product_id).execute()
    db.table("launches").delete().eq("product_id", product_id).execute()
    db.table("upvotes").delete().eq("product_id", product_id).execute()
    
    # Delete product
    result = db.table("products").delete().eq("id", product_id).execute()
    
    return {"success": True, "message": f"Product {product_id} deleted", "admin": admin["email"]}


# ========== USER MANAGEMENT ==========

@router.get("/users")
def get_all_users_admin(x_clerk_user_id: Optional[str] = Header(None)) -> list[dict]:
    """Get all users for admin."""
    verify_admin(x_clerk_user_id)
    
    db = get_db()
    
    result = db.table("users").select(
        "id, email, full_name, role, created_at"
    ).order("created_at", desc=True).execute()
    
    return result.data or []


@router.post("/users/{user_id}/role")
def update_user_role(
    user_id: str,
    role: str,
    x_clerk_user_id: Optional[str] = Header(None)
) -> dict:
    """Update a user's role (founder, buyer, admin)."""
    admin = verify_admin(x_clerk_user_id)
    
    if role not in ["founder", "buyer", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be: founder, buyer, admin")
    
    db = get_db()
    
    result = db.table("users").update({
        "role": role
    }).eq("id", user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"success": True, "message": f"User role updated to {role}", "admin": admin["email"]}


# ========== REVIEW MANAGEMENT ==========

@router.get("/reviews")
def get_all_reviews_admin(x_clerk_user_id: Optional[str] = Header(None)) -> list[dict]:
    """Get all reviews for admin moderation."""
    verify_admin(x_clerk_user_id)
    
    db = get_db()
    
    result = db.table("reviews").select(
        "id, product_id, rating, comment, reviewer_name, sentiment_score, verified, created_at"
    ).order("created_at", desc=True).execute()
    
    return result.data or []


@router.delete("/reviews/{review_id}")
def delete_review_admin(
    review_id: int,
    x_clerk_user_id: Optional[str] = Header(None)
) -> dict:
    """Delete a review (admin only)."""
    admin = verify_admin(x_clerk_user_id)
    
    db = get_db()
    db.table("reviews").delete().eq("id", review_id).execute()
    
    return {"success": True, "message": f"Review {review_id} deleted", "admin": admin["email"]}


@router.post("/reviews/{review_id}/verify")
def verify_review_admin(
    review_id: int,
    x_clerk_user_id: Optional[str] = Header(None)
) -> dict:
    """Mark a review as verified."""
    admin = verify_admin(x_clerk_user_id)
    
    db = get_db()
    
    result = db.table("reviews").update({
        "verified": True
    }).eq("id", review_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return {"success": True, "message": f"Review {review_id} verified", "admin": admin["email"]}
