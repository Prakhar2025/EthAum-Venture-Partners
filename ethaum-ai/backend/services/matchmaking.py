"""EthAum AI — AI Matchmaking Service (Phase 7 Upgrade).

Phase 7 upgrade: Scoring model now factors in compliance match and geography
match per the build plan spec, giving a more healthcare-relevant match signal.

Upgraded scoring formula (per Phase 7 spec):
    Category match    40%
    Compliance match  30%
    Geography match   20%
    Trust Score       10%

Backward compatible: the router (matchmaking.py) calls match_buyers_to_startup()
with the same signature and gets back the same response shape.
"""

from __future__ import annotations

import logging

log = logging.getLogger(__name__)


# ─── HEALTHCARE BUYER PERSONAS ───────────────────────────────────────────────
# Upgraded Phase 7: each persona now has compliance_required and geography_focus

BUYER_PERSONAS: list[dict] = [
    {
        "id":                 1,
        "buyer_type":         "Hospital Network",
        "categories":         ["hospital_mgmt", "diagnostics", "telehealth"],
        "compliance_required": ["hipaa", "hl7", "fhir"],
        "geography_focus":    ["us", "usa", "united states"],
        "min_trust_score":    80,
        "description":        "Large US hospital networks seeking compliant EHR and diagnostic AI",
    },
    {
        "id":                 2,
        "buyer_type":         "Pharma Enterprise",
        "categories":         ["chronic_disease", "diagnostics", "medical_devices"],
        "compliance_required": ["fda", "ce_mark", "iso13485"],
        "geography_focus":    ["us", "eu", "europe", "global"],
        "min_trust_score":    75,
        "description":        "Global pharma companies integrating AI into clinical pipelines",
    },
    {
        "id":                 3,
        "buyer_type":         "Insurance / Payor",
        "categories":         ["chronic_disease", "wellness", "mental_health"],
        "compliance_required": ["hipaa", "soc2"],
        "geography_focus":    ["us", "usa", "united states"],
        "min_trust_score":    70,
        "description":        "Health insurers optimising patient outcomes and claims",
    },
    {
        "id":                 4,
        "buyer_type":         "Telehealth Platform",
        "categories":         ["telehealth", "mental_health", "wellness"],
        "compliance_required": ["hipaa"],
        "geography_focus":    ["us", "global", "uk", "canada"],
        "min_trust_score":    65,
        "description":        "D2C and B2B telehealth platforms scaling remote care",
    },
    {
        "id":                 5,
        "buyer_type":         "MedTech / Device Corp",
        "categories":         ["medical_devices", "diagnostics", "cardiology"],
        "compliance_required": ["fda", "ce_mark", "iso13485", "mdr"],
        "geography_focus":    ["us", "eu", "europe", "global"],
        "min_trust_score":    80,
        "description":        "Medical device companies embedding software intelligence",
    },
    {
        "id":                 6,
        "buyer_type":         "Health System (EU)",
        "categories":         ["hospital_mgmt", "telehealth", "diagnostics"],
        "compliance_required": ["gdpr", "ce_mark", "mdr"],
        "geography_focus":    ["eu", "europe", "uk", "germany", "france"],
        "min_trust_score":    75,
        "description":        "European health systems adopting digital health solutions",
    },
]


# ─── SCORING ENGINE ──────────────────────────────────────────────────────────

def _category_score(product_category: str, buyer_categories: list[str]) -> tuple[int, str]:
    """40% weight bucket — healthcare category alignment."""
    cat = (product_category or "").lower().replace(" ", "_")
    if cat in [c.lower() for c in buyer_categories]:
        return 40, f"Strong category fit: {cat.replace('_', ' ').title()}"
    # Partial — any keyword overlap
    for bc in buyer_categories:
        if bc.lower() in cat or cat in bc.lower():
            return 20, "Partial category alignment"
    return 0, ""


def _compliance_score(
    product_compliance: list[str],
    buyer_compliance: list[str],
) -> tuple[int, str]:
    """30% weight bucket — compliance certification overlap."""
    product_certs = {c.lower().strip() for c in (product_compliance or [])}
    buyer_certs   = {c.lower().strip() for c in (buyer_compliance or [])}

    if not buyer_certs:
        return 20, "No compliance requirements specified"

    if not product_certs:
        return 0, "No compliance certifications on record"

    overlap = product_certs & buyer_certs
    coverage = len(overlap) / len(buyer_certs)

    if coverage >= 0.75:
        return 30, f"Full compliance match: {', '.join(sorted(overlap)).upper()}"
    if coverage >= 0.4:
        return 18, f"Partial compliance match: {', '.join(sorted(overlap)).upper()}"
    if overlap:
        return 10, f"Minimal compliance overlap: {', '.join(sorted(overlap)).upper()}"
    return 0, "No compliance certificate match"


def _geography_score(
    product_geography: list[str],
    buyer_geography: list[str],
) -> tuple[int, str]:
    """20% weight bucket — geographic market overlap."""
    prod_geo   = {g.lower().strip() for g in (product_geography or [])}
    buyer_geo  = {g.lower().strip() for g in (buyer_geography or [])}

    # "global" matches everything
    if "global" in prod_geo or "global" in buyer_geo:
        return 20, "Global market coverage — universal fit"

    if not prod_geo or not buyer_geo:
        return 10, "Geography not specified — assuming potential fit"

    overlap = prod_geo & buyer_geo
    if overlap:
        return 20, f"Geographic overlap: {', '.join(g.title() for g in sorted(overlap))}"

    return 0, "No geographic overlap"


def _trust_score_contribution(trust_score: int, min_required: int) -> tuple[int, str]:
    """10% weight bucket — trust score threshold."""
    if trust_score >= min_required:
        if trust_score >= 85:
            return 10, f"Excellent credibility (Trust Score: {trust_score})"
        if trust_score >= 70:
            return 7,  f"Good credibility (Trust Score: {trust_score})"
        return 5, f"Acceptable credibility (Trust Score: {trust_score})"
    return 0, f"Below minimum trust threshold ({min_required} required)"


def _recommendation_label(score: int) -> str:
    if score >= 80:
        return "Highly Recommended — Ideal enterprise fit"
    if score >= 60:
        return "Recommended — Strong alignment potential"
    if score >= 40:
        return "Consider — Worth further exploration"
    return "Low Match — May require nurturing"


# ─── PUBLIC API ──────────────────────────────────────────────────────────────

def match_buyers_to_startup(
    category: str,
    trust_score: int,
    market_traction: int,
    compliance: list[str] | None = None,
    geography: list[str] | None = None,
) -> list[dict]:
    """
    Phase 7 AI matchmaking — upgraded scoring model.

    Scoring (100 pts max):
        Category alignment    40 pts  (healthcare-specific categories)
        Compliance match      30 pts  (certification overlap with buyer requirements)
        Geography match       20 pts  (market geographic overlap)
        Trust Score           10 pts  (threshold-based credibility check)

    Args:
        category:       Startup's healthcare_category (from Phase 2 V2 fields)
        trust_score:    Computed Trust Score 0-100
        market_traction: Market traction signal 0-100 (used for context only in Phase 7)
        compliance:     List of startup's compliance certifications (e.g. ['hipaa', 'soc2'])
        geography:      List of startup's geographic markets (e.g. ['US', 'EU'])

    Returns:
        Top 5 buyer matches sorted by score descending, each with score and reasons.
    """
    compliance = compliance or []
    geography  = geography  or []
    matches    = []

    for buyer in BUYER_PERSONAS:
        total_score  = 0
        reasons: list[str] = []

        # ── 1. Category (40%) ─────────────────────────────────────────────────
        cat_pts, cat_reason = _category_score(category, buyer["categories"])
        total_score += cat_pts
        if cat_reason:
            reasons.append(cat_reason)

        # ── 2. Compliance (30%) ───────────────────────────────────────────────
        cmp_pts, cmp_reason = _compliance_score(compliance, buyer["compliance_required"])
        total_score += cmp_pts
        if cmp_reason:
            reasons.append(cmp_reason)

        # ── 3. Geography (20%) ────────────────────────────────────────────────
        geo_pts, geo_reason = _geography_score(geography, buyer["geography_focus"])
        total_score += geo_pts
        if geo_reason:
            reasons.append(geo_reason)

        # ── 4. Trust Score (10%) ──────────────────────────────────────────────
        ts_pts, ts_reason = _trust_score_contribution(trust_score, buyer["min_trust_score"])
        total_score += ts_pts
        if ts_reason:
            reasons.append(ts_reason)

        # Only include matches above 30 points (30% threshold)
        if total_score >= 30:
            matches.append({
                "buyer_type":        buyer["buyer_type"],
                "buyer_description": buyer["description"],
                "match_score":       min(100, max(0, total_score)),
                "reasons":           reasons,
                "recommendation":    _recommendation_label(total_score),
                "scoring_breakdown": {
                    "category_alignment":  cat_pts,
                    "compliance_match":    cmp_pts,
                    "geography_match":     geo_pts,
                    "trust_score":         ts_pts,
                },
            })

        log.debug(
            f"[matchmaking] {buyer['buyer_type']}: total={total_score} "
            f"(cat={cat_pts}, cmp={cmp_pts}, geo={geo_pts}, ts={ts_pts})"
        )

    matches.sort(key=lambda x: x["match_score"], reverse=True)
    return matches[:5]
