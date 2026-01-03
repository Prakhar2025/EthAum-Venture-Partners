# EthAum AI

AI-Powered SaaS Marketplace for Series A-D Startups.

Combines the best of **Product Hunt**, **G2**, and **Gartner** into one unified platform.

## Features

- 🚀 **Launch & Buzz** - Product Hunt-style launches with upvoting
- ⭐ **Reviews & Trust** - G2-style reviews with AI sentiment analysis
- 📊 **Insights & Validation** - Gartner-style quadrant visualization
- 🔒 **Trust Scores** - AI-powered credibility scoring

## Tech Stack

### Backend
- FastAPI
- Python 3.11+
- Pydantic

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts

## Getting Started

### Backend

```bash
cd backend
pip install -r ../requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
ethaum-ai/
├── backend/
│   ├── main.py              # FastAPI entry
│   ├── core/config.py       # Configuration
│   ├── routers/             # API routes
│   ├── schemas/             # Pydantic models
│   └── services/            # Business logic
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # UI components
│   │   └── lib/             # Utilities & API
└── requirements.txt
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/products` | GET | List products |
| `/api/v1/products/{id}` | GET | Product details |
| `/api/v1/launches` | POST | Create launch |
| `/api/v1/launches/leaderboard` | GET | Top launches |
| `/api/v1/reviews` | POST | Create review |
| `/api/v1/reviews/{product_id}` | GET | Product reviews |

## License

MIT
