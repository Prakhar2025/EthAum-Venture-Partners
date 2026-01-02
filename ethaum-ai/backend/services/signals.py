"""EthAum AI - Trust Signal Processing Service.

This module provides deterministic helper functions to calculate
individual trust signal scores used as inputs for the overall
Trust Score calculation.
"""


def calculate_data_integrity_score(has_https: bool, domain_age_years: int) -> int:
    """
    Calculate the Data Integrity score based on legitimacy signals.

    Logic:
        - +50 points if the site uses HTTPS (security baseline)
        - +50 points if the domain is at least 2 years old (established presence)

    Args:
        has_https: Whether the website has a valid SSL certificate.
        domain_age_years: Age of the domain in years.

    Returns:
        Integer score between 0 and 100.
    """
    score = 0

    if has_https:
        score += 50

    if domain_age_years >= 2:
        score += 50

    return min(100, score)


def calculate_market_traction_score(employee_count: int) -> int:
    """
    Calculate the Market Traction score based on team size.

    Logic:
        - <10 employees  → 30 (early stage)
        - 10–50 employees → 60 (growing)
        - >50 employees  → 90 (established)

    Args:
        employee_count: Number of employees at the company.

    Returns:
        Integer score (30, 60, or 90).
    """
    if employee_count < 10:
        return 30
    elif employee_count <= 50:
        return 60
    else:
        return 90


def calculate_user_sentiment_score(average_rating: float) -> int:
    """
    Calculate the User Sentiment score from review ratings.

    Logic:
        Scales a 1–5 star rating to a 0–100 score.
        Formula: ((rating - 1) / 4) * 100

    Args:
        average_rating: Average user rating from 1.0 to 5.0.

    Returns:
        Integer score between 0 and 100.
    """
    # Clamp rating to valid range
    clamped_rating = max(1.0, min(5.0, average_rating))

    # Scale 1–5 to 0–100
    score = ((clamped_rating - 1) / 4) * 100

    return round(score)
