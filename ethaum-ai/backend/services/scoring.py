"""EthAum AI - Trust Score Calculation Service.

This module implements an explainable credibility scoring system
for startup discovery. The score is designed to be transparent
and easy to understand for both founders and enterprise buyers.
"""


def calculate_trust_score(
    data_integrity: int,
    market_traction: int,
    user_sentiment: int,
) -> int:
    """
    Calculate the Trust Score for a startup.

    Formula:
        Trust Score = 0.40 × Market Traction
                    + 0.35 × Data Integrity
                    + 0.25 × User Sentiment

    Weight Rationale:
        - Market Traction (40%): Strongest signal of product-market fit
          and reduced risk. Hardest metric to fake.
        - Data Integrity (35%): Establishes legitimacy before judging
          quality. Penalizes shell companies.
        - User Sentiment (25%): Qualitative check on satisfaction.
          Slightly lower weight as it's more subjective.

    Args:
        data_integrity: Score from 0-100 measuring legitimacy signals
                        (domain age, SSL, business registry match).
        market_traction: Score from 0-100 measuring growth signals
                         (employee count, web traffic rank).
        user_sentiment: Score from 0-100 measuring review sentiment
                        (NLP analysis of reviews).

    Returns:
        Integer trust score clamped between 0 and 100.
    """
    raw_score = (
        0.40 * market_traction
        + 0.35 * data_integrity
        + 0.25 * user_sentiment
    )

    # Clamp between 0 and 100
    clamped_score = max(0, min(100, round(raw_score)))

    return clamped_score
