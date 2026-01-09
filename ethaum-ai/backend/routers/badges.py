"""EthAum AI - Embeddable Badge Router with Supabase Database."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse
from database import get_db

router = APIRouter()


@router.get("/{product_id}")
def get_badge_data(product_id: int) -> dict:
    """
    Get embeddable badge data for a startup.
    """
    db = get_db()
    
    product_result = db.table("products").select("*").eq("id", product_id).execute()
    if not product_result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = product_result.data[0]
    trust_score = product.get("trust_score", 75)
    badge_level = _get_badge_level(trust_score)
    
    base_url = "https://ethaum.ai"
    
    return {
        "product": {
            "id": product_id,
            "name": product["name"],
            "trust_score": trust_score,
        },
        "badge": {
            "level": badge_level,
            "verified": True,
            "issued_date": "2026-01-03",
            "valid_until": "2027-01-03",
        },
        "embed_codes": {
            "html": f'''<a href="{base_url}/product/{product_id}" target="_blank">
  <img src="{base_url}/api/v1/badges/{product_id}/image" alt="EthAum Verified - {badge_level}" />
</a>''',
            "markdown": f"[![EthAum Verified]({base_url}/api/v1/badges/{product_id}/image)]({base_url}/product/{product_id})",
            "react": f'''<EthAumBadge productId={product_id} score={trust_score} level="{badge_level}" />''',
        },
        "preview_url": f"{base_url}/api/v1/badges/{product_id}/preview",
    }


@router.get("/{product_id}/preview", response_class=HTMLResponse)
def get_badge_preview(product_id: int) -> HTMLResponse:
    """
    Get a visual HTML preview of the embeddable badge.
    """
    db = get_db()
    
    product_result = db.table("products").select("*").eq("id", product_id).execute()
    if not product_result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = product_result.data[0]
    trust_score = product.get("trust_score", 75)
    badge_level = _get_badge_level(trust_score)
    badge_color = _get_badge_color(trust_score)
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .ethaum-badge {{
                display: inline-flex;
                align-items: center;
                gap: 12px;
                padding: 12px 20px;
                background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
                border: 2px solid {badge_color};
                border-radius: 12px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                text-decoration: none;
                color: inherit;
                transition: transform 0.2s, box-shadow 0.2s;
            }}
            .ethaum-badge:hover {{
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.12);
            }}
            .badge-logo {{
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 18px;
            }}
            .badge-content {{
                display: flex;
                flex-direction: column;
            }}
            .badge-title {{
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
            }}
            .badge-subtitle {{
                font-size: 12px;
                color: #6b7280;
            }}
            .badge-score {{
                font-size: 24px;
                font-weight: bold;
                color: {badge_color};
                margin-left: 12px;
            }}
        </style>
    </head>
    <body style="display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f3f4f6;">
        <a href="https://ethaum.ai/product/{product_id}" class="ethaum-badge" target="_blank">
            <div class="badge-logo">E</div>
            <div class="badge-content">
                <span class="badge-title">EthAum Verified</span>
                <span class="badge-subtitle">{badge_level}</span>
            </div>
            <span class="badge-score">{trust_score}</span>
        </a>
    </body>
    </html>
    """
    
    return HTMLResponse(content=html, status_code=200)


def _get_badge_level(score: int) -> str:
    """Get badge level based on trust score."""
    if score >= 90:
        return "Platinum"
    elif score >= 80:
        return "Gold"
    elif score >= 70:
        return "Silver"
    else:
        return "Bronze"


def _get_badge_color(score: int) -> str:
    """Get badge color based on trust score."""
    if score >= 90:
        return "#7c3aed"
    elif score >= 80:
        return "#10b981"
    elif score >= 70:
        return "#3b82f6"
    else:
        return "#6b7280"
