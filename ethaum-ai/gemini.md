# Gemini Instructions — EthAum.ai

## What This Project Is
EthAum.ai = AI-powered SaaS marketplace combining Product Hunt + G2 + Gartner + AppSumo for Series A-D startups. Built in 4 phases, solo developer, production-deployed.

## Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts
- **Backend:** FastAPI, Python 3.9+, Pydantic v2
- **Database:** Supabase (PostgreSQL) — accessed via `postgrest-py` client ONLY
- **Auth:** Clerk — user identity via `X-Clerk-User-Id` HTTP header
- **Deployed:** Vercel (frontend) + Render (backend, free tier, 30s cold start)

## Architecture Rules

### Frontend (Next.js App Router)
- Use `@/` prefix for ALL imports — never relative `../../`
- ONLY App Router (`/src/app/`) — no `pages/` directory
- Mark components with `"use client"` if they use: `useState`, `useEffect`, `useRouter`, `onClick`
- API calls: always use `process.env.NEXT_PUBLIC_API_URL` + `/api/v1/`
- Always handle: loading state (skeleton), error state (message), empty state

### Backend (FastAPI)
- Router files go in `backend/routers/` — import and register in `backend/main.py`
- Schema files go in `backend/schemas/` — one file per domain
- Service files go in `backend/services/` — pure business logic, no HTTP concerns
- All protected endpoints MUST start with:
```python
user_id = request.headers.get("X-Clerk-User-Id")
if not user_id:
    raise HTTPException(status_code=401, detail="Unauthorized")
```

### Database (Supabase)
- Import: `from database import supabase`
- Read: `supabase.table("name").select("*").execute()`
- Filter: `.eq("column", value)`
- Insert: `.insert({...}).execute()`
- Update: `.update({...}).eq("id", id).execute()`
- Delete: `.delete().eq("id", id).execute()`
- NEVER use SQLAlchemy, Prisma, or raw `psycopg2`

## Database Schema (Key Tables)
| Table | Key Columns |
|-------|-------------|
| `products` | id, name, category, trust_score, status (pending/approved/rejected) |
| `users` | id, clerk_id, email, role (buyer/founder/admin) |
| `reviews` | id, product_id, user_id, rating, content, sentiment_score |
| `launches` | id, product_id, user_id, upvote_count |
| `upvotes` | id, launch_id, user_id |
| `deals` | id, product_id, discount_percentage, description |
| `pilot_requests` | id, product_id, buyer_id, status |

## AI Components (Do Not Replace)
- `backend/services/sentiment.py` — keyword-based sentiment (no external API)
- `backend/services/scoring.py` — dynamic trust score (formula: upvotes 40% + reviews 35% + integrity 25%)
- `backend/routers/recommendations.py` — trending, similar, for-you endpoints

## Environment Variables
**Backend (.env):** `SUPABASE_URL`, `SUPABASE_KEY`
**Frontend (.env.local):** `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`

## Hard Rules
- NO SQLAlchemy, NO Prisma, NO axios, NO react-router-dom
- NO `pages/` directory in Next.js
- NO raw SQL strings
- NO frontend files that import from `backend/`
- ALWAYS maintain existing folder structure
