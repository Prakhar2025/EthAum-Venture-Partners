"""EthAum AI — Sentiment Analysis Service (Phase 7 Upgrade).

Phase 7: Replaced keyword-based heuristic with Groq LLaMA 3.3-70b-versatile
for production-grade sentiment scoring.

Fallback chain:
    1. Try Groq LLaMA (if GROQ_API_KEY is set)
    2. Fall back to keyword heuristic (Phase 1 logic) — guarantees system
       never fails even if Groq is unavailable or quota-exceeded.

The public API surface is IDENTICAL to Phase 1:
    analyze_sentiment(text)   → dict  (unchanged shape)
    get_sentiment_score(text) → float (unchanged shape, 0-100)

No changes required in reviews.py or any caller.
"""

import logging
import os

log = logging.getLogger(__name__)

# ─── GROQ CLIENT (lazy init) ─────────────────────────────────────────────────

_groq_client = None


def _get_groq():
    """Return a Groq client if GROQ_API_KEY is set, else None."""
    global _groq_client
    if _groq_client is not None:
        return _groq_client
    key = os.getenv("GROQ_API_KEY", "")
    if not key:
        return None
    try:
        from groq import Groq
        _groq_client = Groq(api_key=key)
        return _groq_client
    except ImportError:
        log.warning("groq package not installed — using keyword fallback sentiment")
        return None


# ─── LLM SENTIMENT ───────────────────────────────────────────────────────────

def _analyze_sentiment_llm(text: str) -> float:
    """
    Call Groq LLaMA 3.3-70b to score sentiment.

    Returns a float in [-1.0, 1.0].
    Returns 0.0 on any error (safe fallback to neutral).

    Per build plan prompt (Phase 7):
        "Analyze sentiment. Return ONLY a number -1.0 to 1.0.
         No explanation. Review: {text}"
    """
    client = _get_groq()
    if client is None:
        raise RuntimeError("Groq not available")

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"Analyze sentiment. Return ONLY a number -1.0 to 1.0. "
                        f"No explanation. Review: {text[:500]}"
                    ),
                }
            ],
            max_tokens=10,
            temperature=0.0,
        )
        raw = response.choices[0].message.content.strip()
        score = float(raw)
        # Clamp to valid range
        return max(-1.0, min(1.0, score))
    except (ValueError, TypeError) as e:
        log.warning(f"Groq returned non-numeric sentiment: {e}")
        return 0.0
    except Exception as e:
        log.error(f"Groq sentiment call failed: {e}")
        raise


# ─── KEYWORD FALLBACK (Phase 1 logic — preserved exactly) ────────────────────

POSITIVE_WORDS = {
    "excellent", "amazing", "great", "awesome", "fantastic", "wonderful",
    "outstanding", "exceptional", "perfect", "brilliant", "superb", "love",
    "loved", "best", "incredible", "impressive", "recommend", "recommended",
    "helpful", "easy", "fast", "reliable", "efficient", "intuitive",
    "powerful", "innovative", "seamless", "smooth", "professional", "quality",
    "valuable", "useful", "friendly", "responsive", "solid", "robust",
    "clean", "simple", "elegant", "beautiful", "modern", "nice", "good",
    "happy", "satisfied", "pleased", "delighted", "thrilled", "exceeded",
    "worth", "must-have", "game-changer", "revolutionary", "transformed",
}

NEGATIVE_WORDS = {
    "terrible", "awful", "horrible", "bad", "worst", "poor", "disappointing",
    "disappointed", "frustrating", "frustrated", "annoying", "annoyed", "slow",
    "buggy", "broken", "useless", "worthless", "waste", "overpriced", "expensive",
    "complicated", "confusing", "difficult", "hard", "clunky", "outdated",
    "unreliable", "unstable", "crashes", "error", "errors", "bug", "bugs",
    "problem", "problems", "issue", "issues", "fail", "failed", "failing",
    "lacks", "lacking", "missing", "incomplete", "limited", "hate", "hated",
    "regret", "avoid", "doesn't", "can't", "couldn't", "wouldn't",
    "never", "nothing", "nobody", "nowhere", "neither", "scam", "fraud",
}

INTENSIFIERS = {
    "very", "really", "extremely", "incredibly", "absolutely", "totally",
    "completely", "highly", "super", "so", "too", "exceptionally",
}

NEGATORS = {
    "not", "no", "never", "neither", "nobody", "nothing", "nowhere",
    "hardly", "barely", "scarcely", "don't", "doesn't", "didn't",
    "won't", "wouldn't", "couldn't", "shouldn't", "isn't", "aren't",
}


def _analyze_sentiment_keyword(text: str) -> dict:
    """Keyword heuristic fallback — identical to Phase 1 implementation."""
    if not text:
        return {"score": 0.0, "label": "neutral", "confidence": 0.0,
                "positive_words": [], "negative_words": []}

    words = text.lower().split()
    found_positive: list[str] = []
    found_negative: list[str] = []
    negation_active = False

    for i, word in enumerate(words):
        clean_word = "".join(c for c in word if c.isalnum())

        if clean_word in NEGATORS:
            negation_active = True
            continue

        is_intensified = i > 0 and words[i - 1].lower() in INTENSIFIERS

        if clean_word in POSITIVE_WORDS:
            if negation_active:
                found_negative.append(clean_word)
                negation_active = False
            else:
                found_positive.append(clean_word)
                if is_intensified:
                    found_positive.append(clean_word)
        elif clean_word in NEGATIVE_WORDS:
            if negation_active:
                found_positive.append(clean_word)
                negation_active = False
            else:
                found_negative.append(clean_word)
                if is_intensified:
                    found_negative.append(clean_word)
        else:
            negation_active = False

    total = len(found_positive) + len(found_negative)
    if total == 0:
        score, confidence = 0.0, 0.2
    else:
        score      = (len(found_positive) - len(found_negative)) / total
        confidence = min(1.0, total / 5)

    label = "positive" if score > 0.2 else ("negative" if score < -0.2 else "neutral")

    return {
        "score":          round(score, 2),
        "label":          label,
        "confidence":     round(confidence, 2),
        "positive_words": list(set(found_positive)),
        "negative_words": list(set(found_negative)),
    }


# ─── PUBLIC API (unchanged signature from Phase 1) ───────────────────────────

def analyze_sentiment(text: str) -> dict:
    """
    Analyze sentiment of review text.

    Phase 7: Tries Groq LLaMA first; falls back to keyword heuristic.

    Returns:
        dict with:
        - score: -1.0 to 1.0 (negative to positive)
        - label: "positive", "negative", or "neutral"
        - confidence: 0.0 to 1.0
        - positive_words: list of found positive words (empty when using LLM)
        - negative_words: list of found negative words (empty when using LLM)
        - engine: "groq_llm" | "keyword_fallback"
    """
    if not text:
        return {
            "score": 0.0, "label": "neutral", "confidence": 0.0,
            "positive_words": [], "negative_words": [], "engine": "keyword_fallback",
        }

    # ── Try Groq LLM ─────────────────────────────────────────────────────────
    try:
        score = _analyze_sentiment_llm(text)
        label = "positive" if score > 0.2 else ("negative" if score < -0.2 else "neutral")
        log.debug(f"[sentiment] groq_llm → {score:.2f} ({label})")
        return {
            "score":          round(score, 2),
            "label":          label,
            "confidence":     0.95,   # LLM is highly confident
            "positive_words": [],
            "negative_words": [],
            "engine":         "groq_llm",
        }
    except Exception:
        log.info("[sentiment] Groq unavailable — using keyword fallback")

    # ── Keyword fallback ─────────────────────────────────────────────────────
    result = _analyze_sentiment_keyword(text)
    result["engine"] = "keyword_fallback"
    return result


def get_sentiment_score(text: str) -> float:
    """
    Get just the sentiment score for a review (0–100 scale).
    Used by reviews.py and scoring.py — signature unchanged from Phase 1.
    """
    result = analyze_sentiment(text)
    # Convert -1..1 → 0..100
    return round((result["score"] + 1) * 50, 2)
