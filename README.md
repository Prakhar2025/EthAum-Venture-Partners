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

## 🧠 Explainable AI by Design
EthAum AI avoids black-box models for credibility.

Every Trust Score includes:
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
- `routers/` → API endpoints
- `schemas/` → Request / response contracts
- `models/` → Internal domain models
- `services/signals.py` → Signal normalization
- `services/scoring.py` → Trust score computation

---

## 🎨 UI / Product Design
The product interface was designed in Figma to reflect the core user journeys
for founders, enterprises, and investors.

The designs focus on clarity, trust signals, and explainable AI.

Figma Design:
👉 https://smooth-planet-44304520.figma.site/

---

## 🔌 API Endpoints (MVP)

| Endpoint | Method | Description |
|--------|--------|------------|
| `/api/v1/products` | POST | Submit startup |
| `/api/v1/products` | GET | List startups |
| `/api/v1/products/{id}` | GET | Startup details + score breakdown |
| `/api/v1/products/{id}/score` | GET | Trust score only |

Swagger UI available at:
`/docs` (when the backend is running locally or deployed)


---

## 🛠️ Tech Stack
- **Backend:** FastAPI (Python)
- **AI Logic:** Rule-based, explainable scoring
- **Data:** In-memory (MVP)
- **Frontend:** Figma-designed UI (Next.js optional)
- **Dev Tools:** Git, REST, OpenAPI

---

## 🤖 AI-Assisted Development
EthAum AI was built using AI-assisted development:
- **Gemini 3 Pro** → system design and scoring logic
- **Claude Opus** → clean backend implementation

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
- Verified data sources and scraping
- Enterprise buyer matchmaking
- Startup comparison insights
- Public credibility badges
- Scalable database integration

---

## 📬 Contact
Built as part of the EthAum AI MVP challenge.

For demo, feedback, or collaboration:
- Name: Prakhar Shukla
- LinkedIn: https://www.linkedin.com/in/prakhar-shukla-471649261
- GitHub: https://github.com/Prakhar2025
- Email: prakhar230125@gmail.com

