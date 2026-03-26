# Claude Instructions — EthAum.ai

-Codex will review your output when you are done

## Project Context
EthAum.ai is a full-stack AI SaaS marketplace. A solo-developer project (~7,000 lines of code, 50+ API endpoints). All four build phases are complete.

## Stack (Memorize This)
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui |
| Backend | FastAPI (Python 3.9+), Pydantic v2 |
| Database | Supabase PostgreSQL via `postgrest-py` |
| Auth | Clerk — header: `X-Clerk-User-Id` |
| Deployment | Vercel (frontend) + Render (backend) |

## Critical Rules

### Frontend
- Absolute imports ONLY: `@/components/`, `@/app/`, `@/hooks/`
- App Router ONLY — never suggest `pages/` directory
- `"use client"` required for: hooks, event handlers, browser APIs
- Fetch pattern: `fetch(\`\${process.env.NEXT_PUBLIC_API_URL}/api/v1/...\`)`
- Always include loading skeletons and error boundaries

### Backend
- Auth check pattern (REQUIRED in every protected route):
```python
user_id = request.headers.get("X-Clerk-User-Id")
if not user_id:
    raise HTTPException(status_code=401, detail="Unauthorized")
```
- DB pattern (REQUIRED — no ORM ever):
```python
from database import supabase
result = supabase.table("products").select("*").execute()
```
- Admin check pattern:
```python
user = supabase.table("users").select("role").eq("clerk_id", user_id).single().execute()
if user.data.get("role") != "admin":
    raise HTTPException(status_code=403, detail="Forbidden")
```

## Key Files to Know
- `backend/database.py` — Supabase singleton client
- `backend/services/scoring.py` — Trust score algorithm
- `backend/services/sentiment.py` — Keyword-based sentiment analysis
- `frontend/src/components/Header.tsx` — Main nav with auth + role-based admin link
- `frontend/src/hooks/useUserSync.ts` — Clerk to Supabase user sync

## User Roles
`buyer` | `founder` | `admin`
Stored in `users.role` column. Checked via `X-Clerk-User-Id` → lookup in `users` table.

## Never Do
- Never use SQLAlchemy, Prisma, Tortoise ORM
- Never use `axios` in frontend (use `fetch`)
- Never use `react-router-dom`
- Never write raw SQL (use Supabase client methods)
- Never add `pages/` directory files
- Never expose secret keys with `NEXT_PUBLIC_` prefix
