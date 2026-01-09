# EthAum AI

**AI-Powered SaaS Marketplace for Series A-D Startups**

Combining the capabilities of Product Hunt + G2 + Gartner + AppSumo into one unified platform with AI-powered credibility scoring and enterprise matchmaking.

## 🚀 Live Demo

| Component | URL |
|-----------|-----|
| **Frontend** | [https://ethaumai.vercel.app](https://ethaumai.vercel.app) |
| **Backend API** | [https://ethaum-venture-partners.onrender.com](https://ethaum-venture-partners.onrender.com) |
| **API Docs** | [https://ethaum-venture-partners.onrender.com/docs](https://ethaum-venture-partners.onrender.com/docs) |

> ⚠️ **Note:** Backend may take ~30 seconds to wake up on first request (free tier cold start).

## 🎥 Demo Video

[![Watch Demo](https://img.shields.io/badge/YouTube-Demo_Video-red?style=for-the-badge&logo=youtube)](https://youtu.be/KPuu3hIaQIY)

---


## 📸 Screenshots

### Homepage
![Homepage](./ethaum-ai/docs/screenshots/home.png)

### G2-Style Comparisons
![Compare Startups](./ethaum-ai/docs/screenshots/compare.png)

### AppSumo-Style Deals
![Enterprise Deals](./ethaum-ai/docs/screenshots/deals.png)

### Analytics Dashboard
![Analytics](./ethaum-ai/docs/screenshots/analytics.png)

### AI Launch Wizard
![Launch Wizard](./ethaum-ai/docs/screenshots/wizard.png)

---

## 🏗️ Architecture

![Architecture Diagram](./ethaum-ai/docs/architecture.png)

---

## 🎯 Problem Statement

Series A-D startups ($1M-$50M ARR) face:
- **High CAC**: Enterprise acquisition costs are unsustainable
- **Trust Gap**: No unified credibility scoring system
- **Fragmented Tools**: Need 4+ platforms (Product Hunt, G2, Gartner, AppSumo)
- **Slow Sales Cycles**: Enterprise deals take 6-12 months

## 💡 Solution: EthAum AI

A one-stop marketplace that:
- **Reduces marketing spend by 80-90%** through organic virality
- **Accelerates enterprise deals** via AI matchmaking and credibility scores
- **Provides embeddable trust badges** for startup websites
- **Offers data-driven insights** without analyst fees

---

## ✨ Features

### 🚀 Product Hunt-Style Launches
- Upvote system with leaderboard
- **AI Launch Wizard** with tagline generation and scheduling recommendations
- Featured badges for top launches

### ⭐ G2-Style Reviews & Comparisons
- Review submission with AI sentiment analysis
- **Side-by-side startup comparisons** with ROI metrics
- **Embeddable credibility badges** with copy-paste embed codes

### 📊 Gartner-Style Insights
- **Emerging Quadrant** visualization (Leaders, Challengers, Visionaries, Niche)
- **Analytics dashboard** with trends and funding distribution
- AI-generated credibility scores

### 💼 AppSumo-Style Deals
- Enterprise pilot programs with credibility backing
- **AI Matchmaking** - recommends enterprise buyers to startups
- Low-risk trial periods (30-60 days)

---

## 🧠 AI Components

### 1. Trust Score Algorithm
```
Trust Score = (Data Integrity × 0.40) + (Market Traction × 0.35) + (User Sentiment × 0.25)
```
- **Data Integrity**: Domain age, team size, funding verification
- **Market Traction**: Revenue, customer count, growth rate
- **User Sentiment**: Review ratings, sentiment analysis

### 2. AI Matchmaking
```
Match Score = Category Match (40) + Trust Score (30) + Market Traction (30)
```
Recommends enterprise buyer personas based on startup profile.

### 3. Launch Template Generator
Pattern-based AI generates:
- Tagline options
- Description templates
- Optimal launch timing (Tuesday 00:01 PST recommended)
- Asset checklists

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Recharts |
| **Backend** | FastAPI (Python), Pydantic |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Clerk |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+

### Installation

```bash
# Clone the repository
git clone https://github.com/Prakhar2025/EthAum-Venture-Partners.git
cd EthAum-Venture-Partners/ethaum-ai

# Backend setup
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

### Access
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 📁 Project Structure

```
EthAum-Venture-Partners/
├── ethaum-ai/
│   ├── backend/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── routers/             # API endpoints
│   │   ├── services/            # AI scoring logic
│   │   └── schemas/             # Pydantic models
│   ├── frontend/
│   │   └── src/
│   │       ├── app/             # Next.js pages
│   │       ├── components/      # UI components
│   │       └── lib/             # API utilities
│   └── docs/
│       ├── architecture.png
│       └── screenshots/
└── render.yaml                  # Deployment config
```

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/products` | GET/POST | Product management |
| `/api/v1/launches/leaderboard` | GET | Top launched products |
| `/api/v1/launches/{id}/upvote` | POST | Upvote a product |
| `/api/v1/reviews/{product_id}` | GET/POST | Reviews with sentiment |
| `/api/v1/insights/quadrant` | GET | Gartner-style quadrant |
| `/api/v1/deals` | GET | Enterprise pilot offers |
| `/api/v1/deals/request` | POST | Request a pilot |
| `/api/v1/matchmaking/{id}` | GET | AI buyer recommendations |
| `/api/v1/comparisons/{id1}/vs/{id2}` | GET | Compare two startups |
| `/api/v1/badges/{id}` | GET | Embeddable badge codes |
| `/api/v1/templates/generate` | POST | AI launch templates |
| `/api/v1/analytics/dashboard` | GET | Trend analytics |

---

## 📱 Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page |
| Marketplace | `/marketplace` | Browse all startups |
| Product Detail | `/product/[id]` | Details + AI matchmaking |
| Compare | `/compare` | Side-by-side comparison |
| Deals | `/deals` | Enterprise pilot offers |
| Insights | `/insights` | Gartner quadrant |
| Analytics | `/analytics` | Trend dashboard |
| Badges | `/badges` | Embeddable widgets |
| Launch Wizard | `/wizard` | AI template generator |
| Launch | `/launch` | Submit new launch |

---

## 📬 Contact

Built for EthAum Venture Partners Hackathon 2026

- **Name**: Prakhar Shukla
- **LinkedIn**: https://www.linkedin.com/in/prakhar-shukla-471649261
- **GitHub**: https://github.com/Prakhar2025
- **Email**: prakhar230125@gmail.com

---

## 📄 License

MIT License
