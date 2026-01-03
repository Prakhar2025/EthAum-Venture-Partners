"""EthAum AI - AI Launch Templates Router.

This router provides AI-guided launch templates, tagline generation,
and scheduling recommendations for Product Hunt-style launches.

NOTE: This is MVP/Demo mode with simulated AI responses.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import random

router = APIRouter()


class LaunchInput(BaseModel):
    """Input for AI launch template generation."""
    startup_name: str
    category: str
    one_liner: str
    target_audience: Optional[str] = None


class LaunchTemplate(BaseModel):
    """AI-generated launch template."""
    taglines: list[str]
    descriptions: list[str]
    best_launch_day: str
    best_launch_time: str
    recommended_assets: list[str]
    tips: list[str]


# AI template patterns (simulated)
TAGLINE_PATTERNS = [
    "The {category} platform that {action}",
    "{action} with AI-powered {category}",
    "Enterprise-grade {category} for {audience}",
    "From {pain_point} to {outcome} in minutes",
    "{category} reimagined for the AI era",
]

DESCRIPTION_PATTERNS = [
    "🚀 Introducing {name} - {one_liner}\n\n✨ Built for {audience}, {name} helps you {benefit}.\n\n💡 Key Features:\n• Feature 1\n• Feature 2\n• Feature 3",
    "We built {name} because {pain_point}.\n\n{name} is {one_liner}.\n\nPerfect for teams that want to {benefit}.",
]


@router.post("/generate")
def generate_launch_template(input_data: LaunchInput) -> dict:
    """
    Generate AI-guided launch templates.
    
    This endpoint provides:
    - Multiple tagline options
    - Description templates
    - Optimal launch timing
    - Asset recommendations
    """
    # Generate taglines (simulated AI)
    taglines = _generate_taglines(input_data)
    
    # Generate descriptions
    descriptions = _generate_descriptions(input_data)
    
    # Calculate best launch timing
    timing = _get_optimal_timing(input_data.category)
    
    # Recommend assets
    assets = _recommend_assets(input_data.category)
    
    # Generate tips
    tips = _generate_tips(input_data.category)
    
    return {
        "input": {
            "startup_name": input_data.startup_name,
            "category": input_data.category,
        },
        "ai_generated": {
            "taglines": taglines,
            "descriptions": descriptions,
            "timing": timing,
            "recommended_assets": assets,
            "launch_tips": tips,
        },
        "ai_confidence": 0.87,  # Simulated confidence score
        "note": "AI-generated suggestions for MVP demonstration",
    }


@router.get("/templates")
def get_launch_templates() -> dict:
    """
    Get pre-built launch templates by category.
    """
    return {
        "templates": [
            {
                "category": "AI/ML",
                "template_name": "AI Product Launch",
                "headline_format": "🤖 [Product Name] - [One-liner with AI focus]",
                "key_sections": ["Problem", "Solution", "Demo Video", "Pricing"],
                "recommended_emojis": ["🤖", "🚀", "⚡", "🎯"],
            },
            {
                "category": "DevOps",
                "template_name": "Developer Tool Launch",
                "headline_format": "⚡ [Product Name] - [Developer benefit]",
                "key_sections": ["Pain Point", "How It Works", "Integration", "Open Source?"],
                "recommended_emojis": ["⚡", "🛠️", "🔧", "💻"],
            },
            {
                "category": "FinTech",
                "template_name": "FinTech Launch",
                "headline_format": "💰 [Product Name] - [Financial outcome]",
                "key_sections": ["Compliance", "Security", "ROI", "Integration"],
                "recommended_emojis": ["💰", "📊", "🔒", "📈"],
            },
        ]
    }


@router.get("/scheduling")
def get_scheduling_recommendations() -> dict:
    """
    Get AI-powered launch scheduling recommendations.
    """
    return {
        "best_days": [
            {"day": "Tuesday", "score": 95, "reason": "Highest engagement historically"},
            {"day": "Wednesday", "score": 88, "reason": "Strong mid-week momentum"},
            {"day": "Thursday", "score": 82, "reason": "Good for B2B products"},
        ],
        "best_times": [
            {"time": "00:01 PST", "score": 100, "reason": "Maximum visibility window"},
            {"time": "06:00 PST", "score": 75, "reason": "Catches European morning"},
        ],
        "avoid": [
            {"day": "Friday", "reason": "Lower weekend engagement"},
            {"day": "Monday", "reason": "Crowded launch day"},
        ],
        "tip": "Launch at 00:01 PST on Tuesday for maximum 24-hour visibility",
    }


def _generate_taglines(input_data: LaunchInput) -> list[str]:
    """Generate multiple tagline options."""
    audience = input_data.target_audience or "modern teams"
    
    return [
        f"The {input_data.category} platform that enterprises trust",
        f"AI-powered {input_data.category} for {audience}",
        f"{input_data.one_liner}",
        f"Enterprise-grade {input_data.category} with AI credibility scoring",
        f"From evaluation to deployment in days, not months",
    ]


def _generate_descriptions(input_data: LaunchInput) -> list[str]:
    """Generate description templates."""
    return [
        f"🚀 Introducing {input_data.startup_name}\n\n{input_data.one_liner}\n\n✨ Built for enterprises, backed by AI credibility scoring.\n\n💡 Why {input_data.startup_name}?\n• Faster implementation\n• Higher ROI\n• Enterprise-grade security",
        f"We built {input_data.startup_name} because enterprise software evaluation is broken.\n\n{input_data.one_liner}\n\nJoin 100+ enterprises already using {input_data.startup_name}.",
    ]


def _get_optimal_timing(category: str) -> dict:
    """Get optimal launch timing based on category."""
    timings = {
        "AI/ML": {"day": "Tuesday", "time": "00:01 PST", "reason": "AI products peak on Tuesdays"},
        "DevOps": {"day": "Wednesday", "time": "00:01 PST", "reason": "Developer engagement highest mid-week"},
        "FinTech": {"day": "Tuesday", "time": "06:00 PST", "reason": "Financial buyers active early"},
    }
    return timings.get(category, {"day": "Tuesday", "time": "00:01 PST", "reason": "Best overall engagement"})


def _recommend_assets(category: str) -> list[str]:
    """Recommend assets to prepare for launch."""
    base_assets = [
        "Product demo video (60-90 seconds)",
        "Hero image (1200x630px)",
        "Product screenshots (3-5)",
        "Founder photo",
    ]
    
    if category == "AI/ML":
        base_assets.append("AI capability demonstration GIF")
    elif category == "DevOps":
        base_assets.append("Integration diagram")
    elif category == "FinTech":
        base_assets.append("Security certification badges")
    
    return base_assets


def _generate_tips(category: str) -> list[str]:
    """Generate category-specific launch tips."""
    tips = [
        "Engage with every comment in the first 2 hours",
        "Share behind-the-scenes story of building the product",
        "Prepare FAQs for common questions",
        "Line up team members to answer technical questions",
    ]
    
    if category == "AI/ML":
        tips.append("Highlight responsible AI practices and data privacy")
    elif category == "FinTech":
        tips.append("Emphasize compliance certifications prominently")
    
    return tips
