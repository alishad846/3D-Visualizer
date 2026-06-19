# ScanVista Deployment Guide

Production targets (Render):

| Service | Render name | URL |
|--------|-------------|-----|
| Frontend | `scanvista` | https://scanvista.onrender.com |
| API | `scanvista-api` | https://scanvista-api.onrender.com |
| PostgreSQL | `scanvista-db` | Internal to Render |
| AI service | `scanvista-ai` | https://scanvista-ai.onrender.com |
| Admin (later) | `scanvista-admin` | https://scanvista-admin.onrender.com |

---

## Deployment blockers fixed in codebase

| Issue | Fix |
|-------|-----|
| Cross-origin auth cookies (FE + API on different `*.onrender.com` hosts) | `SameSite=None` + `Secure` in production (`server/src/utils/cookies.js`) |
| Reverse proxy / rate limits | `app.set('trust proxy', 1)` on API |
| PostgreSQL UUID defaults | `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"` in `schema.sql` |
| SSL to managed Postgres | `pg` pool SSL when not localhost |
| First-deploy schema | `server/scripts/ensure-db.js` + `preDeployCommand` in `render.yaml` |
| SPA routing on static host | `render.yaml` rewrites + `client/public/_redirects` |
| API URL baked at build time | `VITE_API_URL` in Render static site env |

---

## Deploy on Render (recommended)

### 1. Push to GitHub

Ensure `render.yaml` is on your default branch.

### 2. Create Blueprint

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. Connect the `scanvista` repository
3. Render reads `render.yaml` and creates:
   - `scanvista-db` (PostgreSQL)
   - `scanvista-api` (Node web service)
   - `scanvista` (static site)

Service **names** in the blueprint map to default hostnames (`scanvista.onrender.com`, etc.).

### 3. Set required secrets (API service)

In **scanvista-api** → **Environment**:

| Variable | Required | Notes |
|----------|----------|--------|
| `SUPABASE_URL` | Yes (for uploads) | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (for uploads) | Use the Supabase service role key here |
| `SUPABASE_KEY` | Optional fallback | Legacy compatibility only; do not use anon key for server uploads |
| `JWT_SECRET` | Auto-generated | Keep as generated |
| `JWT_REFRESH_SECRET` | Auto-generated | Keep as generated |
| `DATABASE_URL` | From DB | Linked via blueprint |
| `CLIENT_URL` | Set in blueprint | `https://scanvista.onrender.com` |
| `AI_SERVICE_URL` | Yes | `https://scanvista-ai.onrender.com` |
| `REDIS_URL` | Recommended | Redis connection string (Render cache instance) |
| `NODE_ENV` | `production` | Set in blueprint |

Create a Supabase bucket named **`models`** (public) or let the server attempt to create it on first upload.

### 4. Set required secrets (AI service)

In **scanvista-ai** → **Environment**:

| Variable | Required | Notes |
|----------|----------|--------|
| `OPENAI_API_KEY` | Yes | OpenAI API secret key |
| `DATABASE_URL` | Yes | PostgreSQL connection URL (for PGVector recommendations) |
| `AI_SERVICE_PORT` | `8000` | Pre-configured in blueprint |

### 5. Verify static site env

**scanvista** (frontend) must have:

```
VITE_API_URL=https://scanvista-api.onrender.com/api
```

Redeploy the frontend after changing this (Vite inlines env at build time).

### 6. Smoke test

- `GET https://scanvista-api.onrender.com/health` → `{ "status": "OK" }`
- Open `https://scanvista.onrender.com`
- Register / login (cookies cross-origin to API)
- Create project → product → publish → open `/p/{slug}`

---

## Deploy frontend on Vercel (optional)

Primary hosting is **Render** (`scanvista.onrender.com`). `vercel.json` is provided if you prefer Vercel for the static app only.

1. Import repo on Vercel
2. **Root Directory**: repository root (uses `vercel.json` `cd client` commands)
3. Environment variable:
   - `VITE_API_URL` = `https://scanvista-api.onrender.com/api`
4. Deploy

Keep the API on Render so `CLIENT_URL` and CORS stay consistent.

---

## Local development

```bash
# From repo root
npm run install:all

# server/.env  — see server/.env.example
# client/.env  — see client/.env.example

# Apply schema (first time)
cd server && npm run ensure-db

# Run stack
cd .. && npm run dev
```

---

## What is not deployed yet

- **God Mode admin** — design only; future `scanvista-admin.onrender.com`

---

## Troubleshooting

### Login works locally but not on Render

- Confirm `CLIENT_URL` on API = `https://scanvista.onrender.com` (no trailing slash)
- Confirm `VITE_API_URL` was set **before** the last frontend build
- Browser devtools → Network → `/api/auth/login` should return `Set-Cookie` with `SameSite=None; Secure`

### Upload fails

- Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` on the API service
- Ensure `models` bucket exists and allows public reads for asset URLs
- If you only set an anon key, Storage uploads will fail with row-level security errors

### Database errors on first deploy

- Check API deploy logs for `[ensure-db]`
- Manually run from Render shell: `cd server && npm run ensure-db`

### Cold starts (free tier)

Render free services spin down after inactivity; first request may take 30–60s.
