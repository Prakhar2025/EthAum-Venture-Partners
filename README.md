# EthAum AI

**AI-Powered SaaS Marketplace for Series A-D Startups**

Combining Product Hunt + G2 + Gartner + AppSumo into one unified platform with AI-powered credibility scoring, sentiment analysis, and smart recommendations.

---

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

| Homepage | Compare | Deals |
|----------|---------|-------|
| ![Homepage](./ethaum-ai/docs/screenshots/home.png) | ![Compare](./ethaum-ai/docs/screenshots/compare.png) | ![Deals](./ethaum-ai/docs/screenshots/deals.png) |

| Analytics | Launch Wizard |
|-----------|---------------|
| ![Analytics](./ethaum-ai/docs/screenshots/analytics.png) | ![Wizard](./ethaum-ai/docs/screenshots/wizard.png) |

---

## 📊 Project Stats

| Metric | Count |
|--------|-------|
| **Backend Lines** | ~2,748 (Python) |
| **Frontend Lines** | ~4,423 (TypeScript/TSX) |
| **Total Lines** | ~7,171 |
| **API Endpoints** | 50+ |
| **Router Files** | 14 |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Recharts |
| **Backend** | FastAPI (Python), Pydantic |
| **Database** | PostgreSQL (Supabase) |
| **Authentication** | Clerk (with Supabase sync) |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 🏗️ Architecture

![Architecture Diagram](./ethaum-ai/docs/architecture.png)

---

## ✨ Development Phases

### Phase 1: Core Infrastructure ✅
- PostgreSQL database with Supabase
- User authentication with Clerk
- Role-based access (Buyer, Founder, Admin)
- Database migrations

### Phase 2: Enhanced Features ✅
- Real product submission with database storage
- User reviews with star ratings
- Upvote system with one-vote-per-user
- Leaderboard with live upvote counts
- G2-style product comparisons

### Phase 3: Advanced AI ✅
- **AI Sentiment Analysis** - Keyword-based review analysis
- **Dynamic Trust Scores** - Updates on reviews/upvotes
- **Smart Recommendations** - Similar, trending, for-you
- **Trending Section** - Homepage with top products

### Phase 4: Admin & Polish ✅
- **Admin Dashboard** - Stats, products, users, reviews management
- **Product Moderation** - Approve/reject workflow
- **Professional Navigation** - Tools dropdown, admin-only visibility
- **Role-based Access** - Admin endpoints secured

---

## 🎯 Problem Statement

Series A-D startups ($1M-$50M ARR) face:
- **High CAC**: Enterprise acquisition costs are unsustainable
- **Trust Gap**: No unified credibility scoring system
- **Fragmented Tools**: Need 4+ platforms (Product Hunt, G2, Gartner, AppSumo)

## 💡 Solution

A one-stop marketplace that:
- **Reduces marketing spend by 80-90%** through organic virality
- **Accelerates enterprise deals** via AI matchmaking and credibility scores
- **Provides embeddable trust badges** for startup websites

---

## 🔌 Key API Endpoints

### Products & Reviews
| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/products` | Submit new product |
| `GET /api/v1/products` | List approved products |
| `POST /api/v1/reviews/` | Submit review with AI sentiment |
| `POST /api/v1/launches/{id}/upvote` | Upvote product |

### AI Features
| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/recommendations/trending` | Trending products |
| `GET /api/v1/recommendations/similar/{id}` | Similar products |
| `GET /api/v1/reviews/{id}/sentiment-summary` | Sentiment breakdown |

### Admin (Requires admin role)
| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/admin/stats` | Dashboard stats |
| `POST /api/v1/admin/products/{id}/approve` | Approve product |
| `GET /api/v1/admin/users` | All users |

---

## 📱 Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing + trending |
| Marketplace | `/marketplace` | Browse approved products |
| Product Detail | `/product/[id]` | Details + reviews + AI recommendations |
| Leaderboard | `/leaderboard` | Top products by upvotes |
| Compare | `/compare` | Side-by-side comparison |
| Deals | `/deals` | Enterprise pilots |
| Insights | `/insights` | Gartner-style quadrant |
| Analytics | `/analytics` | Trends dashboard |
| Badges | `/badges` | Embeddable widgets |
| Launch Wizard | `/wizard` | AI template generator |
| Submit | `/submit` | Add your startup |
| My Products | `/my-products` | Manage your products |
| Admin | `/admin` | Admin dashboard (admin only) |

---

## 🔐 Security Features

- **Authentication**: Clerk JWT verification via `X-Clerk-User-Id` header
- **Role-Based Access**: Admin endpoints verify `role = 'admin'`
- **Input Validation**: Pydantic schemas for all requests
- **CORS**: Configured for frontend origins
- **Product Moderation**: New products require admin approval

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Supabase account
- Clerk account

### Installation

```bash
# Clone the repository
git clone https://github.com/Prakhar2025/EthAum-Venture-Partners.git
cd EthAum-Venture-Partners/ethaum-ai

# Backend setup
cd backend
pip install -r requirements.txt
# Create .env with SUPABASE_URL, SUPABASE_KEY
uvicorn main:app --reload --port 8000

# Frontend setup (new terminal)
cd frontend
npm install
# Create .env.local with NEXT_PUBLIC_API_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
npm run dev
```

### Access
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **buyer** | Browse, review, upvote |
| **founder** | Submit products, manage own products |
| **admin** | Full access + moderation |

---

## 🧠 AI Components

### Trust Score Algorithm
```
Trust Score = (Data Integrity × 0.35) + (Market Traction × 0.40) + (User Sentiment × 0.25)
```

### AI Sentiment Analysis
- Keyword-based detection of positive/negative words
- Combined rating + text sentiment scoring
- Automatic trust score updates

### Smart Recommendations
- Similar products by category
- Trending by recent upvotes
- Personalized suggestions

---

## 📄 License

MIT License

---

## 👥 Team

Built for EthAum Venture Partners Hackathon 2026
