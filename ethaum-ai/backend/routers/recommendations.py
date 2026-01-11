"""EthAum AI - Smart Recommendations Router.

Provides AI-powered product recommendations:
- Similar products by category
- Trending products by recent activity
- New arrivals
"""

from fastapi import APIRouter
from database import get_db
from datetime import datetime, timedelta

router = APIRouter()


@router.get("/similar/{product_id}")
def get_similar_products(product_id: int, limit: int = 5) -> dict:
    """
    Get products similar to the given product.
    Based on category matching and trust score proximity.
    """
    db = get_db()
    
    # Get the source product
    product_result = db.table("products").select("category, trust_score").eq("id", product_id).execute()
    
    if not product_result.data:
        return {"products": [], "algorithm": "category_match"}
    
    source = product_result.data[0]
    source_category = source["category"]
    source_score = source["trust_score"]
    
    # Find products in same category, excluding the source
    similar_result = db.table("products").select(
        "id, name, category, trust_score, website"
    ).eq("category", source_category).neq("id", product_id).limit(limit).execute()
    
    # If not enough in same category, get from other categories
    similar_products = similar_result.data or []
    
    if len(similar_products) < limit:
        # Get more products ordered by trust score
        more_result = db.table("products").select(
            "id, name, category, trust_score, website"
        ).neq("id", product_id).neq("category", source_category).order(
            "trust_score", desc=True
        ).limit(limit - len(similar_products)).execute()
        
        similar_products.extend(more_result.data or [])
    
    # Calculate similarity score for each
    for product in similar_products:
        category_match = 50 if product["category"] == source_category else 20
        score_diff = 100 - abs(product["trust_score"] - source_score)
        product["similarity_score"] = int((category_match + score_diff / 2) / 1.5)
        product["match_reasons"] = []
        
        if product["category"] == source_category:
            product["match_reasons"].append(f"Same category: {source_category}")
        if abs(product["trust_score"] - source_score) <= 10:
            product["match_reasons"].append("Similar trust score")
    
    # Sort by similarity
    similar_products.sort(key=lambda x: x["similarity_score"], reverse=True)
    
    return {
        "products": similar_products[:limit],
        "algorithm": "category_match + trust_score_proximity",
        "source_category": source_category,
    }


@router.get("/trending")
def get_trending_products(limit: int = 10) -> dict:
    """
    Get trending products based on recent upvotes and reviews.
    """
    db = get_db()
    
    # Get launches ordered by upvotes with product info
    launches_result = db.table("launches").select(
        "id, product_id, upvotes, products(id, name, category, trust_score)"
    ).order("upvotes", desc=True).limit(limit).execute()
    
    trending = []
    for launch in launches_result.data or []:
        product = launch.get("products") or {}
        if product:
            trending.append({
                "id": product.get("id"),
                "name": product.get("name"),
                "category": product.get("category"),
                "trust_score": product.get("trust_score"),
                "upvotes": launch["upvotes"],
                "trending_score": launch["upvotes"] * 2 + product.get("trust_score", 0),
            })
    
    # Sort by trending score
    trending.sort(key=lambda x: x["trending_score"], reverse=True)
    
    return {
        "products": trending[:limit],
        "algorithm": "upvotes * 2 + trust_score",
        "time_period": "all_time",
    }


@router.get("/new-arrivals")
def get_new_arrivals(limit: int = 10) -> dict:
    """
    Get recently added products.
    """
    db = get_db()
    
    result = db.table("products").select(
        "id, name, category, trust_score, website, created_at"
    ).order("created_at", desc=True).limit(limit).execute()
    
    return {
        "products": result.data or [],
        "algorithm": "most_recent_first",
    }


@router.get("/for-you")
def get_personalized_recommendations(limit: int = 6) -> dict:
    """
    Get personalized recommendations.
    For now, returns a mix of trending and high-trust products.
    Future: Use user behavior to personalize.
    """
    db = get_db()
    
    # Get high trust score products
    high_trust = db.table("products").select(
        "id, name, category, trust_score"
    ).gte("trust_score", 80).order("trust_score", desc=True).limit(limit // 2).execute()
    
    # Get trending (most upvoted)
    trending = db.table("launches").select(
        "products(id, name, category, trust_score)"
    ).order("upvotes", desc=True).limit(limit // 2).execute()
    
    products = []
    seen_ids = set()
    
    for p in (high_trust.data or []):
        if p["id"] not in seen_ids:
            products.append({**p, "reason": "High credibility score"})
            seen_ids.add(p["id"])
    
    for launch in (trending.data or []):
        p = launch.get("products")
        if p and p["id"] not in seen_ids:
            products.append({**p, "reason": "Trending now"})
            seen_ids.add(p["id"])
    
    return {
        "products": products[:limit],
        "algorithm": "hybrid: high_trust + trending",
        "personalized": False,
        "message": "Sign in for personalized recommendations",
    }


@router.get("/categories/{category}")
def get_products_by_category(category: str, limit: int = 10) -> dict:
    """
    Get top products in a specific category.
    """
    db = get_db()
    
    result = db.table("products").select(
        "id, name, category, trust_score, website"
    ).eq("category", category).order("trust_score", desc=True).limit(limit).execute()
    
    return {
        "category": category,
        "products": result.data or [],
        "total": len(result.data or []),
    }
