# AI Learning Assistant (Prototype)

An AI-assisted learning workspace where users can:
- organize study content in folders/files,
- chat with an LLM using file-grounded context,
- create and review revision notes,
- track confusion/mistake patterns over time.

This is currently a prototype focused on UPSC learners, but the architecture is domain-agnostic and can be extended for other academic streams.

## Current Status

This project is in active development (prototype/MVP stage).  
Core workflows are working end-to-end, and the next phase is improving agent quality, personalization, and scale readiness.

## Key Features

- AI chat on top of user-managed study files
- Agent-based confusion/error categorization:
  - `CONFUSION`
  - `MISTAKE`
  - `CONCEPT_MISUNDERSTANDING`
- Daily revision pipeline for unresolved notes
- Progress dashboard:
  - resolution rate
  - review counts
  - error-type breakdown
  - 7-day trend summary
- Hierarchical directories + file and note management

## Architecture

- Frontend: Next.js (App Router), TypeScript
- Backend: FastAPI, Python
- LLM/Agent layer: Gemini + PydanticAI agents
- Data layer: SQLAlchemy (backend), Prisma (Next.js routes), SQLite/PostgreSQL via `DATABASE_URL`

## Repository Structure

```text
.
├── src/                    # Next.js frontend + API routes
├── backend/                # FastAPI app, agents, models, API routers
├── prisma/                 # Prisma schema/migrations
├── public/                 # Static assets
└── render.yaml             # Render backend blueprint
```

## Local Setup

### 1) Clone and install frontend deps

```bash
npm install
```

### 2) Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 3) Environment variables

Create:
- root `.env` from `.env.example`
- `backend/.env` from `backend/.env.example`

Minimum required:
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_API_URL` (frontend, default local backend URL)
- `DATABASE_URL` (recommended for production)
- `CORS_ORIGINS` (backend allowed frontend origins)

### 4) Run backend

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5) Run frontend

```bash
npm run dev
```

Frontend: `http://localhost:3000`  
Backend: `http://127.0.0.1:8000`

## Deployment

### Backend (Render)

- Use `render.yaml` or create a Web Service with:
  - Root directory: `backend`
  - Build: `pip install -r requirements.txt`
  - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Set env vars: `GEMINI_API_KEY`, `DATABASE_URL`, `CORS_ORIGINS`

### Frontend (Vercel)

- Import the same repo
- Root directory: repository root
- Set env vars:
  - `NEXT_PUBLIC_API_URL=https://<your-render-backend>`
  - `GEMINI_API_KEY=<your_key>` (if using server-side routes requiring Gemini)

## API Health Check

```bash
GET /health
```

Expected response:

```json
{ "status": "healthy" }
```

## Roadmap

- Better prompt orchestration and evaluation for agent outputs
- Multi-domain subject profiles (beyond UPSC)
- Retrieval layer for larger document sets
- Personalization and adaptive revision scheduling
- Stronger testing and observability
