# EthAum AI 🚀  
AI-Powered SaaS Credibility & Startup Discovery Platform

## 🧩 Overview
EthAum AI is an AI-driven SaaS marketplace designed to help enterprises, investors, and founders quickly assess the credibility of Series A–D startups.  
The platform combines startup discovery with an explainable AI-based Trust Score that reduces due-diligence time and surfaces high-signal products.

---

## ❌ Problem
Discovering reliable B2B SaaS startups today is noisy and inefficient:
- Review platforms can be manipulated
- Analyst reports are expensive and slow
- Early traction signals are scattered across sources
- Enterprises lack a fast, objective credibility signal

As a result, promising startups struggle with trust, and buyers face high evaluation costs.

---

## ✅ Solution
EthAum AI provides a **single, transparent credibility score** backed by explainable AI logic.

The platform allows:
- Founders to submit startups for credibility scoring
- Buyers and investors to discover high-trust startups
- All users to understand *why* a startup scores the way it does

In addition to AI-based credibility scoring, EthAum AI supports Product Hunt–style startup launches with upvotes and rankings, along with G2-style review sentiment analysis integrated into the Trust Score.

---

## ⭐ Key Feature: AI Trust Score
At the core of EthAum AI is an explainable Trust Score (0–100).

### Scoring Philosophy
> **“First we verify you exist, then we verify you grow, finally we verify you are loved.”**

### Scoring Weights
| Signal | Weight | Reason |
|------|--------|-------|
| Market Traction | 40% | Strongest indicator of product-market fit |
| Data Integrity | 35% | Ensures legitimacy and compliance |
| User Sentiment | 25% | Captures real user experience |

### Formula

Trust Score = round(
0.40 × Market Traction +
0.35 × Data Integrity +
0.25 × User Sentiment
)


This approach prioritizes **business viability and legitimacy** over popularity alone.

---

## 🌟 Overall Credibility Score (Key Differentiator)
Beyond the Trust Score, EthAum AI provides a **unified credibility metric** that combines all platform signals:

### Formula

Overall Credibility = 
0.30 × Launch Signal (Product Hunt upvotes) +
0.30 × Review Signal (G2 ratings & volume) +
0.40 × Trust Score (Gartner data/traction)


### Output Features
- **0-100 Score** with explainable breakdown
- **Badge Tiers**: Elite (90+), Verified Leader (80+), Rising Star (70+)
- **Emerging Quadrant**: Gartner-style positioning (Leaders, Challengers, Visionaries, Niche)
- **Actionable Insights**: AI-generated recommendations for improvement
- **Embeddable Widgets**: Badges for startup websites

This unified metric is what differentiates EthAum AI from competitors—a single, transparent score across all validation dimensions.

---

## 🧠 Explainable AI by Design
EthAum AI avoids black-box models for credibility.

Every score (Trust Score + Overall Credibility) includes:
- Individual signal scores
- Weight transparency
- Clear justification understandable by non-technical users

This makes the system suitable for enterprise and investor use.

---

## 🏗️ Architecture

Frontend (Next.js – optional)
|
FastAPI Backend
|
Signals Layer → Scoring Layer


### Backend Modules
- `routers/` → API endpoints (products, launches, reviews, insights)
- `schemas/` → Request / response contracts
- `models/` → Internal domain models
- `services/signals.py` → Signal normalization
- `services/scoring.py` → Trust score computation
- `services/credibility.py` → Overall credibility scoring engine

---

## 🎨 UI / Product Design
The product interface was designed in Figma to reflect the core user journeys
for founders, enterprises, and investors.

The designs focus on clarity, trust signals, and explainable AI.

Figma Design:
👉 https://smooth-planet-44304520.figma.site/

---

## 🔌 API Endpoints (MVP)

### Product Hunt Features
| Endpoint | Method | Description |
|--------|--------|------------|
| `/api/v1/launches` | POST | Submit product launch |
| `/api/v1/launches/{id}/upvote` | POST | Upvote a launch |
| `/api/v1/launches/leaderboard` | GET | Top launches by upvotes |

### G2 Features
| Endpoint | Method | Description |
|--------|--------|------------|
| `/api/v1/reviews` | POST | Submit review/testimonial |
| `/api/v1/reviews/{product_id}` | GET | Get reviews for product |

### Gartner Features
| Endpoint | Method | Description |
|--------|--------|------------|
| `/api/v1/products` | POST | Submit startup |
| `/api/v1/products` | GET | List startups |
| `/api/v1/products/{id}` | GET | Startup details + trust score breakdown |
| `/api/v1/insights/{id}/credibility` | GET | Overall credibility score (unified metric) |
| `/api/v1/insights/quadrant` | GET | Emerging Leaders Quadrant view |
| `/api/v1/insights/{id}/badge` | GET | Embeddable badge for startup sites |

Swagger UI available at:
`/docs` (when the backend is running locally or deployed)
---

## 🛠️ Tech Stack
- **Backend:** FastAPI (Python) with CORS support
- **AI Logic:** Rule-based, explainable scoring (no ML training required)
- **Data:** In-memory storage (MVP) - production-ready for DB integration
- **API Design:** RESTful with OpenAPI/Swagger documentation
- **Frontend:** Figma-designed UI (implementation ready)
- **Dev Tools:** Git, Python type hints, modular architecture

---

## 🤖 AI-Assisted Development
EthAum AI was built using AI-assisted development:
- **Gemini 3 Pro** → system design and scoring logic
- **Claude Opus** → clean backend implementation
- **GitHub Copilot** → code completion and optimization

Human-led design decisions ensure correctness, clarity, and reliability.

---

## 🚧 MVP Constraints
To maintain speed and clarity, the MVP intentionally excludes:
- Payments or transactions
- External web scraping
- Chat or messaging systems
- Mobile apps


---

## 🗺️ Roadmap
### Phase 1 (Complete ✅)
- ✅ Product Hunt-style launches and upvoting
- ✅ G2-style reviews and testimonials
- ✅ Gartner-style insights and credibility scoring
- ✅ Emerging Quadrant visualization
- ✅ Embeddable badge system

### Phase 2 (Future)
- AppSumo-style deals and enterprise pilots
- AI matchmaking for buyer-startup connections
- Verified data sources and web scraping
- Real-time analytics dashboards
- Scalable database integration (PostgreSQL)
- Authentication and user management

---

## 📬 Contact
Built as part of the EthAum AI MVP challenge.

For demo, feedback, or collaboration:
- Name: Prakhar Shukla
- LinkedIn: https://www.linkedin.com/in/prakhar-shukla-471649261
- GitHub: https://github.com/Prakhar2025
- Email: prakhar230125@gmail.com

