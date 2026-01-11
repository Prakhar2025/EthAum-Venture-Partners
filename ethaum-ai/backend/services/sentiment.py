"""EthAum AI - Sentiment Analysis Service.

Keyword-based sentiment analysis for review text.
No external API needed - uses curated word lists.
"""

# Positive words commonly used in product reviews
POSITIVE_WORDS = {
    "excellent", "amazing", "great", "awesome", "fantastic", "wonderful",
    "outstanding", "exceptional", "perfect", "brilliant", "superb", "love",
    "loved", "best", "incredible", "impressive", "recommend", "recommended",
    "helpful", "easy", "fast", "reliable", "efficient", "intuitive",
    "powerful", "innovative", "seamless", "smooth", "professional", "quality",
    "valuable", "useful", "friendly", "responsive", "solid", "robust",
    "clean", "simple", "elegant", "beautiful", "modern", "nice", "good",
    "happy", "satisfied", "pleased", "delighted", "thrilled", "exceeded",
    "worth", "must-have", "game-changer", "revolutionary", "transformed"
}

# Negative words commonly used in product reviews
NEGATIVE_WORDS = {
    "terrible", "awful", "horrible", "bad", "worst", "poor", "disappointing",
    "disappointed", "frustrating", "frustrated", "annoying", "annoyed", "slow",
    "buggy", "broken", "useless", "worthless", "waste", "overpriced", "expensive",
    "complicated", "confusing", "difficult", "hard", "clunky", "outdated",
    "unreliable", "unstable", "crashes", "error", "errors", "bug", "bugs",
    "problem", "problems", "issue", "issues", "fail", "failed", "failing",
    "lacks", "lacking", "missing", "incomplete", "limited", "hate", "hated",
    "regret", "avoid", "don't", "doesn't", "can't", "couldn't", "wouldn't",
    "never", "nothing", "nobody", "nowhere", "neither", "scam", "fraud"
}

# Intensity modifiers
INTENSIFIERS = {
    "very", "really", "extremely", "incredibly", "absolutely", "totally",
    "completely", "highly", "super", "so", "too", "exceptionally"
}

NEGATORS = {
    "not", "no", "never", "neither", "nobody", "nothing", "nowhere",
    "hardly", "barely", "scarcely", "don't", "doesn't", "didn't",
    "won't", "wouldn't", "couldn't", "shouldn't", "isn't", "aren't"
}


def analyze_sentiment(text: str) -> dict:
    """
    Analyze sentiment of review text.
    
    Returns:
        dict with:
        - score: -1.0 to 1.0 (negative to positive)
        - label: "positive", "negative", or "neutral"
        - confidence: 0.0 to 1.0
        - positive_words: list of found positive words
        - negative_words: list of found negative words
    """
    if not text:
        return {
            "score": 0.0,
            "label": "neutral",
            "confidence": 0.0,
            "positive_words": [],
            "negative_words": []
        }
    
    # Normalize text
    words = text.lower().split()
    
    # Track found words
    found_positive = []
    found_negative = []
    
    # Check for negation context
    negation_active = False
    
    for i, word in enumerate(words):
        # Clean punctuation
        clean_word = ''.join(c for c in word if c.isalnum())
        
        # Check for negators
        if clean_word in NEGATORS:
            negation_active = True
            continue
        
        # Check for intensifiers (boost next word)
        is_intensified = i > 0 and words[i-1].lower() in INTENSIFIERS
        
        if clean_word in POSITIVE_WORDS:
            if negation_active:
                found_negative.append(clean_word)
                negation_active = False
            else:
                found_positive.append(clean_word)
                if is_intensified:
                    found_positive.append(clean_word)  # Count twice
        
        elif clean_word in NEGATIVE_WORDS:
            if negation_active:
                found_positive.append(clean_word)
                negation_active = False
            else:
                found_negative.append(clean_word)
                if is_intensified:
                    found_negative.append(clean_word)  # Count twice
        else:
            negation_active = False
    
    # Calculate score
    total_sentiment_words = len(found_positive) + len(found_negative)
    
    if total_sentiment_words == 0:
        score = 0.0
        confidence = 0.2
    else:
        score = (len(found_positive) - len(found_negative)) / total_sentiment_words
        confidence = min(1.0, total_sentiment_words / 5)  # More words = more confident
    
    # Determine label
    if score > 0.2:
        label = "positive"
    elif score < -0.2:
        label = "negative"
    else:
        label = "neutral"
    
    return {
        "score": round(score, 2),
        "label": label,
        "confidence": round(confidence, 2),
        "positive_words": list(set(found_positive)),
        "negative_words": list(set(found_negative))
    }


def get_sentiment_score(text: str) -> float:
    """
    Get just the sentiment score for a review.
    Returns value between 0 and 100 for storing in database.
    """
    result = analyze_sentiment(text)
    # Convert -1 to 1 range to 0 to 100 range
    return round((result["score"] + 1) * 50, 2)
