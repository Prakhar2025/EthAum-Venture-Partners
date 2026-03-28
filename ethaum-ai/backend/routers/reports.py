"""EthAum AI — Reports Router (Phase 6 + Phase 7).

Phase 6 endpoints (unchanged):
    GET  /api/v1/reports/investor/trends        → category-level analytics from live Supabase data
    POST /api/v1/reports/generate/{product_id}  → AI due diligence PDF (investor plan gated)

Phase 7 additions:
    POST /api/v1/reports/validation/{product_id} → Gartner-style AI Validation PDF
        Plan gate: 'reports' feature → Growth plan or above
        Content: Market positioning, competitive landscape, Trust Score context,
                 reviewer sentiment highlights, EthAum recommendation badge

Auth: X-Clerk-User-Id on all routes.

Environment variables:
    GROQ_API_KEY   → AI narrative in all PDF types (graceful fallback if missing)
"""

import io
import os
import logging
from datetime import datetime
from typing import Optional
from collections import defaultdict

from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import StreamingResponse

from database import get_db
from services.plan_gates import require_feature

log = logging.getLogger(__name__)

router = APIRouter()

HEALTHCARE_CATEGORIES = [
    "chronic_disease",
    "cardiology",
    "mental_health",
    "diagnostics",
    "hospital_mgmt",
    "wellness",
    "telehealth",
    "medical_devices",
    "pharmacy",
    "edtech_health",
]

CATEGORY_LABELS: dict[str, str] = {
    "chronic_disease": "Chronic Disease",
    "cardiology":      "Cardiology",
    "mental_health":   "Mental Health",
    "diagnostics":     "Diagnostics & Imaging",
    "hospital_mgmt":   "Hospital Management",
    "wellness":        "Wellness & Preventive",
    "telehealth":      "Telehealth",
    "medical_devices": "Medical Devices & IoT",
    "pharmacy":        "Pharmacy & MedTech",
    "edtech_health":   "EdTech Health",
}


# ─── INVESTOR TRENDS ─────────────────────────────────────────────────────────

@router.get("/investor/trends")
def get_investor_trends(
    x_clerk_user_id: Optional[str] = Header(None),
) -> dict:
    """Return healthcare category analytics from live Supabase data.

    Auth required. No plan gate — available to all authenticated investors.
    Returns category counts, average trust scores, and platform-wide summary.
    """
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    db = get_db()

    # Fetch all approved healthcare products
    result = (
        db.table("products")
        .select("healthcare_category, trust_score, vertical")
        .eq("status", "approved")
        .execute()
    )

    products = result.data or []

    # Aggregate by healthcare_category
    cat_counts: dict[str, list[int]] = defaultdict(list)
    for p in products:
        cat = p.get("healthcare_category") or "other"
        score = p.get("trust_score") or 70
        cat_counts[cat].append(score)

    # Build category trend rows
    categories = []
    for cat, scores in cat_counts.items():
        avg = round(sum(scores) / len(scores), 1)
        categories.append({
            "category":        cat,
            "label":           CATEGORY_LABELS.get(cat, cat.replace("_", " ").title()),
            "count":           len(scores),
            "avg_trust_score": avg,
            "is_hot":          False,  # set below
        })

    # Sort by count desc and flag top 2 as "Hot this month"
    categories.sort(key=lambda c: c["count"], reverse=True)
    for i, cat in enumerate(categories):
        cat["is_hot"] = i < 2

    # Platform-wide stats
    all_scores = [p.get("trust_score", 70) for p in products]
    avg_platform = round(sum(all_scores) / len(all_scores), 1) if all_scores else 0.0

    return {
        "categories":              categories,
        "total_startups":          len(products),
        "avg_platform_trust_score": avg_platform,
    }


# ─── DUE DILIGENCE PDF ───────────────────────────────────────────────────────

def _build_pdf(product: dict, reviews: list[dict], launch: dict, ai_narrative: str) -> bytes:
    """Build a professional PDF due diligence report using reportlab."""
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        )
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="reportlab not installed. Run: pip install reportlab",
        )

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles    = getSampleStyleSheet()
    TEAL      = colors.HexColor("#10b981")
    DARK      = colors.HexColor("#0f172a")
    MID_GRAY  = colors.HexColor("#64748b")
    LIGHT_BG  = colors.HexColor("#f0fdf4")

    h1  = ParagraphStyle("H1",  parent=styles["Heading1"],  fontSize=22, textColor=DARK,     spaceAfter=6)
    h2  = ParagraphStyle("H2",  parent=styles["Heading2"],  fontSize=14, textColor=TEAL,     spaceAfter=4, spaceBefore=14)
    bod = ParagraphStyle("Body", parent=styles["Normal"],   fontSize=10, textColor=DARK,     spaceAfter=4, leading=15)
    sub = ParagraphStyle("Sub",  parent=styles["Normal"],   fontSize=9,  textColor=MID_GRAY, spaceAfter=2)

    product_name = product.get("name", "Unknown")
    trust_score  = product.get("trust_score", 70)
    breakdown    = {
        "Data Integrity":   product.get("data_integrity", 70),
        "Market Traction":  product.get("market_traction", 70),
        "User Sentiment":   product.get("user_sentiment", 70),
    }
    compliance   = product.get("compliance") or []
    category     = CATEGORY_LABELS.get(product.get("healthcare_category", ""), product.get("healthcare_category", "N/A"))
    revenue_stage = product.get("revenue_stage", "N/A")
    team_size    = product.get("team_size", "N/A")
    funding      = product.get("total_funding", "N/A")
    geography    = ", ".join(product.get("geography") or []) or "N/A"
    upvotes      = launch.get("upvotes", 0)

    # Sentiment summary
    avg_rating   = round(sum(r.get("rating", 3) for r in reviews) / len(reviews), 1) if reviews else None

    now = datetime.utcnow().strftime("%B %d, %Y")
    story = []

    # ── Cover ─────────────────────────────────────────────────────────────────
    story.append(Paragraph("EthAum AI", ParagraphStyle("Brand", parent=styles["Normal"], fontSize=10, textColor=TEAL)))
    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph(f"Due Diligence Report: {product_name}", h1))
    story.append(Paragraph(f"Generated {now} · Confidential", sub))
    story.append(HRFlowable(width="100%", thickness=1, color=TEAL, spaceAfter=12))

    # ── Trust Score summary ───────────────────────────────────────────────────
    story.append(Paragraph("Trust Score Analysis", h2))
    story.append(Paragraph(
        f"EthAum AI Trust Score: <b>{trust_score}/100</b>. "
        "This score is a weighted composite of Data Integrity (35%), "
        "Market Traction (40%), and User Sentiment (25%).",
        bod,
    ))

    score_data = [["Component", "Score", "Weight"]] + [
        [k, f"{v}/100", w]
        for (k, v), w in zip(breakdown.items(), ["35%", "40%", "25%"])
    ]
    score_table = Table(score_data, colWidths=[8 * cm, 4 * cm, 4 * cm])
    score_table.setStyle(TableStyle([
        ("BACKGROUND",  (0, 0), (-1, 0), TEAL),
        ("TEXTCOLOR",   (0, 0), (-1, 0), colors.white),
        ("FONTNAME",    (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",    (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [LIGHT_BG, colors.white]),
        ("GRID",        (0, 0), (-1, -1), 0.25, colors.HexColor("#d1fae5")),
        ("ALIGN",       (1, 0), (-1, -1), "CENTER"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING",  (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(score_table)

    # ── Company Overview ──────────────────────────────────────────────────────
    story.append(Paragraph("Company Overview", h2))
    overview_data = [
        ["Healthcare Category", category],
        ["Revenue Stage",       revenue_stage.replace("_", " ").title() if revenue_stage else "N/A"],
        ["Team Size",           team_size],
        ["Total Funding",       funding],
        ["Geography",           geography],
        ["Platform Upvotes",    str(upvotes)],
        ["Reviews",             str(len(reviews))],
        ["Avg Star Rating",     f"{avg_rating}/5" if avg_rating else "No reviews yet"],
    ]
    ov_table = Table(overview_data, colWidths=[8 * cm, 8 * cm])
    ov_table.setStyle(TableStyle([
        ("FONTSIZE",      (0, 0), (-1, -1), 9),
        ("FONTNAME",      (0, 0), (-1, -1), "Helvetica"),
        ("FONTNAME",      (0, 0), (0, -1), "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [LIGHT_BG, colors.white]),
        ("GRID",          (0, 0), (-1, -1), 0.25, colors.HexColor("#d1fae5")),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(ov_table)

    # ── Compliance Status ─────────────────────────────────────────────────────
    story.append(Paragraph("Compliance & Certifications", h2))
    if compliance:
        for cert in compliance:
            story.append(Paragraph(f"✅  {cert.upper()}", bod))
    else:
        story.append(Paragraph("No compliance certifications on record.", bod))

    # ── Review Sentiment ──────────────────────────────────────────────────────
    story.append(Paragraph("Review Sentiment Summary", h2))
    if reviews:
        story.append(Paragraph(
            f"{len(reviews)} review(s) collected on EthAum AI. "
            f"Average rating: <b>{avg_rating}/5.0</b>.",
            bod,
        ))
        for r in reviews[:3]:
            snippet = (r.get("content") or r.get("body") or "")[:200]
            if snippet:
                story.append(Paragraph(f"<i>"{snippet}…"</i>", sub))
    else:
        story.append(Paragraph("No reviews collected on EthAum AI yet.", bod))

    # ── AI Narrative ──────────────────────────────────────────────────────────
    if ai_narrative:
        story.append(Paragraph("AI Analysis (Powered by Groq LLaMA)", h2))
        for para in ai_narrative.strip().split("\n\n"):
            if para.strip():
                story.append(Paragraph(para.strip(), bod))

    # ── Disclaimer ────────────────────────────────────────────────────────────
    story.append(Spacer(1, 1 * cm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=MID_GRAY))
    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph(
        "This report is generated automatically by EthAum AI based on platform data. "
        "It does not constitute financial advice. Conduct independent due diligence before investment.",
        sub,
    ))

    doc.build(story)
    return buf.getvalue()


def _call_groq_narrative(product: dict, reviews: list[dict]) -> str:
    """Call Groq LLaMA to generate an AI due diligence narrative. Returns empty string on failure."""
    groq_key = os.getenv("GROQ_API_KEY", "")
    if not groq_key:
        log.warning("GROQ_API_KEY not set — skipping AI narrative in report")
        return ""

    try:
        from groq import Groq
        client = Groq(api_key=groq_key)

        review_snippets = "\n".join(
            f'- "{(r.get("content") or r.get("body") or "")[:150]}" (rating: {r.get("rating", "N/A")}/5)'
            for r in reviews[:5]
        ) or "No reviews available."

        prompt = f"""You are a healthcare VC analyst writing a structured due diligence report.

Product: {product.get('name')}
Category: {product.get('healthcare_category', 'N/A')}
Revenue Stage: {product.get('revenue_stage', 'N/A')}
Trust Score: {product.get('trust_score', 70)}/100
Compliance: {', '.join(product.get('compliance') or []) or 'None on record'}
Team Size: {product.get('team_size', 'N/A')}
Total Funding: {product.get('total_funding', 'N/A')}
Geography: {', '.join(product.get('geography') or []) or 'N/A'}
Description: {(product.get('description') or '')[:400]}

Recent Reviews:
{review_snippets}

Write a concise due diligence report with these sections:
1. Executive Summary (2-3 sentences)
2. Market Positioning
3. Trust Score Analysis
4. Risk Factors
5. EthAum AI Recommendation

Be factual, concise, and professional. Under 400 words total."""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=600,
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        log.error(f"Groq narrative generation failed: {e}")
        return ""


@router.post("/generate/{product_id}")
def generate_due_diligence(
    product_id: int,
    x_clerk_user_id: Optional[str] = Header(None),
) -> StreamingResponse:
    """Generate an AI-powered PDF due diligence report for a given startup.

    - Auth: X-Clerk-User-Id required
    - Plan gate: investor plan required (feature: trend_data)
    - Returns: PDF as StreamingResponse (application/pdf)
    """
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Plan gate — investor plan only
    require_feature(x_clerk_user_id, "trend_data")

    db = get_db()

    # Fetch product
    p_result = db.table("products").select("*").eq("id", product_id).execute()
    if not p_result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    product = p_result.data[0]

    # Fetch reviews
    r_result = (
        db.table("reviews")
        .select("rating, content, body, sentiment_score")
        .eq("product_id", product_id)
        .execute()
    )
    reviews = r_result.data or []

    # Fetch launch / upvotes
    l_result = db.table("launches").select("upvotes").eq("product_id", product_id).execute()
    launch = l_result.data[0] if l_result.data else {"upvotes": 0}

    # Generate AI narrative (graceful degradation)
    ai_narrative = _call_groq_narrative(product, reviews)

    # Build PDF
    pdf_bytes = _build_pdf(product, reviews, launch, ai_narrative)

    product_name_slug = (product.get("name") or "report").lower().replace(" ", "_")
    filename = f"ethaum_dd_{product_name_slug}_{product_id}.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ─── PHASE 7: AI VALIDATION REPORT ───────────────────────────────────────────

def _build_validation_pdf(product: dict, reviews: list[dict], ai_analysis: str) -> bytes:
    """Build a Gartner-style AI Validation PDF using reportlab."""
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        )
    except ImportError:
        raise HTTPException(status_code=503, detail="reportlab not installed")

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        rightMargin=2 * cm, leftMargin=2 * cm,
        topMargin=2 * cm, bottomMargin=2 * cm,
    )

    styles   = getSampleStyleSheet()
    VIOLET   = colors.HexColor("#7c3aed")
    DARK     = colors.HexColor("#0f172a")
    MID_GRAY = colors.HexColor("#64748b")
    LIGHT_BG = colors.HexColor("#f5f3ff")

    h1  = ParagraphStyle("H1",  parent=styles["Heading1"], fontSize=20, textColor=DARK,   spaceAfter=6)
    h2  = ParagraphStyle("H2",  parent=styles["Heading2"], fontSize=13, textColor=VIOLET, spaceAfter=4, spaceBefore=14)
    bod = ParagraphStyle("Body", parent=styles["Normal"],  fontSize=10, textColor=DARK,   spaceAfter=4, leading=15)
    sub = ParagraphStyle("Sub",  parent=styles["Normal"],  fontSize=9,  textColor=MID_GRAY, spaceAfter=2)

    name          = product.get("name", "Unknown")
    trust_score   = product.get("trust_score", 70)
    compliance    = product.get("compliance") or []
    category      = CATEGORY_LABELS.get(product.get("healthcare_category", ""), "Healthcare")
    revenue_stage = (product.get("revenue_stage") or "N/A").replace("_", " ").title()
    geography     = ", ".join(product.get("geography") or []) or "N/A"
    integrations  = ", ".join(product.get("integrations") or []) or "N/A"

    positive = sum(1 for r in reviews if float(r.get("sentiment_score", 0.5)) > 0.6)
    negative = sum(1 for r in reviews if float(r.get("sentiment_score", 0.5)) < 0.4)
    neutral  = len(reviews) - positive - negative
    avg_rating = round(sum(r.get("rating", 3) for r in reviews) / len(reviews), 1) if reviews else None

    now   = datetime.utcnow().strftime("%B %d, %Y")
    story = []

    # ── Cover / Badge ──────────────────────────────────────────────────────────
    story.append(Paragraph("EthAum AI", ParagraphStyle("Brand", parent=styles["Normal"], fontSize=10, textColor=VIOLET)))
    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph(f"AI Validation Report: {name}", h1))
    story.append(Paragraph(f"Issued: {now} · EthAum Validated Healthcare Startup", sub))
    story.append(HRFlowable(width="100%", thickness=1.5, color=VIOLET, spaceAfter=10))

    # EthAum recommendation badge
    badge_label = (
        "⭐ HIGHLY RECOMMENDED" if trust_score >= 80
        else "✅ RECOMMENDED" if trust_score >= 65
        else "ℹ️ VERIFIED LISTING"
    )
    story.append(Paragraph(
        f'<b>{badge_label}</b> — EthAum Trust Score: {trust_score}/100',
        ParagraphStyle("Badge", parent=styles["Normal"], fontSize=12, textColor=VIOLET, spaceAfter=8),
    ))

    # ── Market Positioning ────────────────────────────────────────────────────
    story.append(Paragraph("Market Positioning", h2))
    story.append(Paragraph(
        f"{name} operates in the <b>{category}</b> segment of the healthcare AI market. "
        f"Revenue stage: <b>{revenue_stage}</b>. Geographic coverage: <b>{geography}</b>. "
        f"Platform integrations: {integrations}.",
        bod,
    ))

    # ── Competitive Landscape ─────────────────────────────────────────────────
    story.append(Paragraph("Competitive Landscape", h2))
    story.append(Paragraph(
        f"Within the EthAum marketplace, {name} ranks in the "
        f"{'top tier (Trust Score ≥ 80)' if trust_score >= 80 else 'mid tier (Trust Score 60-79)' if trust_score >= 60 else 'growth stage'} "
        f"of the {category} category. "
        f"Compliance certifications ({', '.join(compliance).upper() if compliance else 'none on record'}) "
        f"{'differentiate' if compliance else 'will need to be addressed to differentiate'} "
        f"this product in enterprise procurement.",
        bod,
    ))

    # ── Trust Score Context ───────────────────────────────────────────────────
    story.append(Paragraph("Trust Score Context", h2))
    breakdown = [
        ["Component", "Score", "Weight", "Description"],
        ["Data Integrity",   f"{product.get('data_integrity', 70)}/100",  "35%", "Legitimacy signals"],
        ["Market Traction",  f"{product.get('market_traction', 70)}/100", "40%", "Growth signals"],
        ["User Sentiment",   f"{product.get('user_sentiment', 70)}/100",  "25%", "Review sentiment"],
    ]
    ts_table = Table(breakdown, colWidths=[5.5 * cm, 3 * cm, 2.5 * cm, 5 * cm])
    ts_table.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, 0), VIOLET),
        ("TEXTCOLOR",     (0, 0), (-1, 0), colors.white),
        ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [LIGHT_BG, colors.white]),
        ("GRID",          (0, 0), (-1, -1), 0.25, colors.HexColor("#ede9fe")),
        ("ALIGN",         (1, 0), (2, -1), "CENTER"),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(ts_table)

    # ── Reviewer Sentiment Highlights ─────────────────────────────────────────
    story.append(Paragraph("Reviewer Sentiment Highlights", h2))
    if reviews:
        story.append(Paragraph(
            f"{len(reviews)} review(s) · Avg Rating {avg_rating}/5 · "
            f"Positive: {positive} · Neutral: {neutral} · Negative: {negative}",
            bod,
        ))
        top_positive = [r for r in reviews if float(r.get("sentiment_score", 0.5)) > 0.6][:2]
        for r in top_positive:
            snippet = (r.get("content") or r.get("comment") or r.get("body") or "")[:200]
            if snippet:
                story.append(Paragraph(f"<i>✅ "{snippet}…"</i>", sub))
    else:
        story.append(Paragraph("No reviews on the EthAum platform yet.", bod))

    # ── AI Analysis ───────────────────────────────────────────────────────────
    if ai_analysis:
        story.append(Paragraph("AI Market Analysis (Groq LLaMA)", h2))
        for para in ai_analysis.strip().split("\n\n"):
            if para.strip():
                story.append(Paragraph(para.strip(), bod))

    # ── EthAum Recommendation ─────────────────────────────────────────────────
    story.append(Spacer(1, 0.5 * cm))
    story.append(HRFlowable(width="100%", thickness=1, color=VIOLET))
    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph("EthAum AI Recommendation", h2))
    story.append(Paragraph(
        f"{badge_label} — This startup has been verified and listed on the EthAum AI Healthcare Marketplace. "
        f"Trust Score: {trust_score}/100. Issued: {now}.",
        bod,
    ))

    # ── Disclaimer ────────────────────────────────────────────────────────────
    story.append(Spacer(1, 0.5 * cm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=MID_GRAY))
    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph(
        "This report is generated automatically by EthAum AI. "
        "It does not constitute financial or regulatory advice. "
        "Available to Growth plan subscribers and above.",
        sub,
    ))

    doc.build(story)
    return buf.getvalue()


def _call_groq_validation(product: dict, reviews: list[dict]) -> str:
    """Groq LLaMA validation analysis prompt. Returns empty string on failure."""
    groq_key = os.getenv("GROQ_API_KEY", "")
    if not groq_key:
        return ""
    try:
        from groq import Groq
        client = Groq(api_key=groq_key)

        avg_rating = round(sum(r.get("rating", 3) for r in reviews) / len(reviews), 1) if reviews else None
        compliance = ", ".join(product.get("compliance") or []) or "none on record"

        prompt = (
            f"You are a Gartner analyst writing a healthcare startup validation report.\n\n"
            f"Startup: {product.get('name')}\n"
            f"Category: {product.get('healthcare_category', 'N/A')}\n"
            f"Trust Score: {product.get('trust_score', 70)}/100\n"
            f"Revenue Stage: {product.get('revenue_stage', 'N/A')}\n"
            f"Compliance: {compliance}\n"
            f"Reviews: {len(reviews)} total, avg rating {avg_rating}/5\n"
            f"Description: {(product.get('description') or '')[:400]}\n\n"
            f"Write a concise market validation with these sections:\n"
            f"1. Market Opportunity (2-3 sentences)\n"
            f"2. Competitive Differentiation\n"
            f"3. EthAum Validation Summary\n\n"
            f"Be factual and professional. Under 300 words."
        )

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=450,
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        log.error(f"Groq validation analysis failed: {e}")
        return ""


@router.post("/validation/{product_id}")
def generate_validation_report(
    product_id: int,
    x_clerk_user_id: Optional[str] = Header(None),
) -> StreamingResponse:
    """Generate a Gartner-style AI Validation PDF for a startup.

    Phase 7 endpoint.
    - Auth: X-Clerk-User-Id required
    - Plan gate: 'reports' feature → Growth plan or above (free for Growth+ startups)
    - Sections: Market positioning, Competitive landscape, Trust Score context,
                Reviewer sentiment highlights, AI analysis, EthAum recommendation badge
    - Returns: StreamingResponse application/pdf
    """
    if not x_clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Growth+ plan required
    require_feature(x_clerk_user_id, "reports")

    db = get_db()

    p_result = db.table("products").select("*").eq("id", product_id).execute()
    if not p_result.data:
        raise HTTPException(status_code=404, detail="Product not found")
    product = p_result.data[0]

    r_result = (
        db.table("reviews")
        .select("rating, content, comment, body, sentiment_score")
        .eq("product_id", product_id)
        .execute()
    )
    reviews = r_result.data or []

    ai_analysis = _call_groq_validation(product, reviews)
    pdf_bytes   = _build_validation_pdf(product, reviews, ai_analysis)

    slug     = (product.get("name") or "validation").lower().replace(" ", "_")
    filename = f"ethaum_validation_{slug}_{product_id}.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
