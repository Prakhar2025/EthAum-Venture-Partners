# EthAum AI

**AI-Powered SaaS Marketplace for Series A-D Startups**

Combining Product Hunt + G2 + Gartner + AppSumo into one unified platform with AI-powered credibility scoring, sentiment analysis, and smart recommendations.

## 🚀 Live Demo

| Component | URL |
|-----------|-----|
| **Frontend** | [https://ethaumai.vercel.app](https://ethaumai.vercel.app) |
| **Backend API** | [https://ethaum-venture-partners.onrender.com](https://ethaum-venture-partners.onrender.com) |
| **API Docs** | [https://ethaum-venture-partners.onrender.com/docs](https://ethaum-venture-partners.onrender.com/docs) |

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
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | FastAPI (Python), Pydantic |
| **Database** | PostgreSQL (Supabase) |
| **Authentication** | Clerk (with Supabase sync) |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## ✨ Features by Phase

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

## 🔌 API Endpoints (50+)

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/products` | Submit new product (pending) |
| GET | `/api/v1/products` | List approved products |
| GET | `/api/v1/products/{id}` | Get product details |
| GET | `/api/v1/products/my-products` | User's products |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/reviews/` | Submit review with sentiment |
| GET | `/api/v1/reviews/{product_id}` | Get product reviews |
| GET | `/api/v1/reviews/{id}/sentiment-summary` | Sentiment breakdown |

### Launches & Upvotes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/launches/` | Launch product |
| POST | `/api/v1/launches/{id}/upvote` | Upvote/downvote |
| GET | `/api/v1/launches/leaderboard` | Top products |

### AI Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/recommendations/trending` | Trending products |
| GET | `/api/v1/recommendations/similar/{id}` | Similar products |
| GET | `/api/v1/recommendations/for-you` | Personalized |
| GET | `/api/v1/recommendations/new-arrivals` | Recent products |

### Admin (Requires admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/stats` | Dashboard stats |
| GET | `/api/v1/admin/products` | All products |
| POST | `/api/v1/admin/products/{id}/approve` | Approve product |
| POST | `/api/v1/admin/products/{id}/reject` | Reject product |
| GET | `/api/v1/admin/users` | All users |
| GET | `/api/v1/admin/reviews` | All reviews |
| POST | `/api/v1/admin/reviews/{id}/verify` | Verify review |

---

## 📱 Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing + trending |
| Marketplace | `/marketplace` | Browse approved products |
| Product Detail | `/product/[id]` | Details + reviews + recommendations |
| Leaderboard | `/leaderboard` | Top products by upvotes |
| Compare | `/compare` | Side-by-side comparison |
| Deals | `/deals` | Enterprise pilots |
| Insights | `/insights` | Quadrant view |
| Analytics | `/analytics` | Trends dashboard |
| Badges | `/badges` | Embeddable widgets |
| Launch Wizard | `/wizard` | AI template generator |
| Submit | `/submit` | Add your startup |
| My Products | `/my-products` | Manage your products |
| Admin | `/admin` | Admin dashboard |

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

## 🗄️ Database Migrations

Run these in Supabase SQL Editor:

```sql
-- 1. Initial schema (products, launches)
-- 2. Users table
-- 3. Reviews, upvotes
-- 4. Upvotes table
-- 5. Product status
ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved';
```

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **buyer** | Browse, review, upvote |
| **founder** | Submit products, manage own products |
| **admin** | Full access + moderation |

Make yourself admin:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 📄 License

MIT License

---

## 👥 Team

Built for EthAum Venture Partners Hackathon 2026
