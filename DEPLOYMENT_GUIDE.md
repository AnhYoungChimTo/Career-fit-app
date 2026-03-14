# Career Fit App — Deployment & Feature Launch Guide

## Stack Overview
- **Frontend:** React 18 + TypeScript + Vite → deployed on **Vercel**
- **Backend:** Node.js + Express + Prisma + PostgreSQL → deployed on **Render**
- **Database:** PostgreSQL → **Render PostgreSQL** (Internal URL)
- **Repo:** `https://github.com/minhanhvibecoding-labs/Career-fit-app`

---

## Live URLs
| Service | URL |
|---------|-----|
| Frontend (Vercel) | `https://career-fit-app-frontend.vercel.app` |
| Backend (Render) | `https://career-fit-app-1.onrender.com` |
| Backend Health | `https://career-fit-app-1.onrender.com/health` |

---

## Environment Variables

### Render (Backend) — set in Render Dashboard → Environment
| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Render PostgreSQL Internal URL |
| `DIRECT_URL` | Same as `DATABASE_URL` |
| `JWT_SECRET` | `f8e7d6c5b4a3928170695847362514039281746553829174635281947362514037` |
| `JWT_EXPIRES_IN` | `7d` |
| `CORS_ORIGIN` | `https://career-fit-app-frontend.vercel.app` |
| `OPENAI_API_KEY` | Your OpenAI key |
| `GPT_ANALYSIS_MODEL` | `gpt-4o` |

### Vercel (Frontend) — set in Vercel Dashboard → Settings → Environment Variables
| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://career-fit-app-1.onrender.com` |

---

## Render Build Settings (Dashboard → Settings → Build & Deploy)
| Setting | Value |
|---------|-------|
| **Root Directory** | *(leave empty)* |
| **Build Command** | `npm install; npm run build` |
| **Start Command** | `npm start` (Render auto-detects from package.json) |

> ⚠️ The `render.yaml` file exists in the repo but Render uses the **Dashboard settings** — always update both.

---

## Critical Rules — Read Before Adding Any Feature

### 1. TypeScript — No `devDependencies` in Backend
Because Render runs `npm install` with `NODE_ENV=production`, it skips `devDependencies`.
**All `@types/*`, `typescript`, `prisma`, `tsx` must stay in `dependencies`** in `backend/package.json`.

### 2. CORS
- Backend `CORS_ORIGIN` must match the Vercel URL **exactly** — no trailing slash, must include `https://`
- Current: `https://career-fit-app-frontend.vercel.app`
- To allow multiple origins, comma-separate them: `https://career-fit-app-frontend.vercel.app,https://other.vercel.app`

### 3. Vite Port
Frontend is locked to port `5173` via `vite.config.ts` (`strictPort: true`). Do not change this.

### 4. API Routes Convention
- All backend routes are prefixed with `/api`
- Mentor routes use **plural**: `/api/mentors/...` (not `/api/mentor/...`)
- Auth routes: `/api/auth/login`, `/api/auth/register`

### 5. Database Migrations
Migrations run **automatically on every Render deploy** via the start command:
```
npx prisma migrate deploy && npm start
```
Never skip `prisma migrate deploy` in production.

---

## Adding a New Feature — Step-by-Step Checklist

### Step 1: Backend
- [ ] Add new Prisma models to `backend/prisma/schema.prisma`
- [ ] Run `npx prisma migrate dev --name your_feature_name` locally
- [ ] Create controller in `backend/src/controllers/your.controller.ts`
- [ ] Add routes in `backend/src/routes/` or append to existing route file
- [ ] Mount routes in `backend/src/server.ts`
- [ ] Run `npx tsc --noEmit` in `/backend` — must have 0 errors before pushing

### Step 2: Frontend
- [ ] Add new TypeScript types to `frontend/src/types/index.ts`
- [ ] Add API methods to `frontend/src/services/api.ts`
- [ ] Create page components in `frontend/src/pages/`
- [ ] Add routes to `frontend/src/App.tsx`
- [ ] Add nav links to `frontend/src/components/Sidebar.tsx` if needed
- [ ] Run `npx tsc -b --noEmit` in `/frontend` — must have 0 errors before pushing

### Step 3: Push & Deploy
```bash
git add .
git commit -m "feat: your feature description"
git push origin main
```
- Vercel auto-deploys on push (frontend)
- Render auto-deploys on push (backend)
- Wait ~2 minutes for both to go live

### Step 4: Verify
```bash
# Check backend health
curl https://career-fit-app-1.onrender.com/health

# Test new endpoint
curl https://career-fit-app-1.onrender.com/api/your-new-endpoint
```

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Could not find declaration file for 'express'` | `@types/express` in devDependencies | Move to `dependencies` in backend/package.json |
| `CORS: origin not allowed` | Wrong `CORS_ORIGIN` in Render | Update to exact Vercel URL without trailing slash, redeploy Render |
| `Network Error` on frontend | `VITE_API_URL` not set or wrong | Set correct Render URL in Vercel env vars, redeploy Vercel |
| `Missing required env variables: DATABASE_URL` | Env var not set in Render | Add DATABASE_URL in Render → Environment |
| `Port 5173 already in use` | Old Vite process still running | `powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess -Force"` |
| `OpenAI crash on startup` | OpenAI client throws when key missing | Pass `apiKey: process.env.OPENAI_API_KEY \|\| 'placeholder-key'` |
| Vercel builds old commit | Vercel not triggering new deploy | Go to Vercel → Deployments → Redeploy latest |
| Render builds old commit | Render not auto-deploying | Go to Render → Manual Deploy → Deploy latest commit |

---

## Local Development

```bash
# Start both servers (from repo root)
npm run dev

# Frontend only (http://localhost:5173)
cd frontend && npm run dev

# Backend only (http://localhost:3001)
cd backend && npm run dev

# Run database migrations
cd backend && npx prisma migrate dev

# Seed database
cd backend && npm run seed
```

### Local Environment (`backend/.env`)
```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:1234567890@localhost:5432/career_fit
DIRECT_URL=postgresql://postgres:1234567890@localhost:5432/career_fit
JWT_SECRET=f8e7d6c5b4a3928170695847362514039281746553829174635281947362514037
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=your-openai-key
CORS_ORIGIN=http://localhost:5173
```

### Local Environment (`frontend/.env`)
```
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Career Fit Analysis
```

---

## Project Structure
```
career-fit-app/
├── frontend/                  # React + Vite (Vercel)
│   ├── src/
│   │   ├── pages/             # Route pages
│   │   ├── components/        # Shared components
│   │   ├── services/api.ts    # All API calls
│   │   ├── types/index.ts     # All TypeScript types
│   │   └── contexts/          # Auth context
│   └── vercel.json            # Vercel config (rewrites for SPA)
├── backend/                   # Express + Prisma (Render)
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   ├── routes/            # Express routers
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Auth middleware
│   │   └── server.ts          # App entry point
│   └── prisma/
│       ├── schema.prisma      # Database schema
│       └── migrations/        # Migration history
└── render.yaml                # Render deployment config
```
