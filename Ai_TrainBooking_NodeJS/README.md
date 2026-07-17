# AI Train Booking (Node.js / Express)

This is a full rewrite of the original Django project to Node.js + Express.
Same features, same frontend (`Ai.html`, `manual.html` were plain HTML/JS
with no Django template syntax, so they're used as-is).

## What maps to what

| Django (old) | Node.js (new) |
|---|---|
| `settings.py` (env vars, CORS, DB) | `server.js` + `.env` |
| `Train/urls.py` + `Ai_TrainBooking/urls.py` | routes mounted in `server.js` / `routes/` |
| `Train/views.py` → `train_static_list` | `routes/trains.js` → `GET /train_static_list` |
| `Train/views.py` → `train_list` (DB-backed) | `routes/trains.js` → `GET /trains` |
| `Train/views.py` → `Ai_Rcommendation` (Gemini) | `routes/ai.js` → `POST /api/ai-recommendation` |
| `Train/models.py` (Train/TrainClass/Seat) | `db/database.js` (SQLite schema via Node's built-in `node:sqlite`) |
| `Train/migrations/0001_initial.py` | `db/database.js` creates tables on first run |
| Django admin (seeding data) | `db/database.js` auto-seeds from `data/trainsData.js` on first run |
| `Train/templates/*.html` | `public/*.html` (served as static files) |
| `requirements.txt` | `package.json` |
| `manage.py runserver` | `npm start` |

There's no Django-admin equivalent here (Express has no built-in admin
site) — if you need to edit train data, edit `data/trainsData.js` or the
SQLite rows directly for now. Say the word if you want a simple admin UI
added.

## Local setup

Requires **Node.js 22.13+** (check with `node -v`) — this project uses
Node's built-in `node:sqlite` module (no native compilation, no build
tools needed, unlike `better-sqlite3`). You'll see an
`ExperimentalWarning: SQLite is an experimental feature` on startup —
that's expected and harmless.

```bash
npm install
cp .env.example .env
```

Open `.env` and add your Gemini key (get one free at
https://aistudio.google.com/apikey). Leave the rest as-is for local dev.

```bash
npm start
```

Visit **http://localhost:8000/**

`npm run dev` restarts automatically on file changes (Node 18.11+).

## Deploying (Render example)

1. Push this to GitHub.
2. On [render.com](https://render.com) → **New > Web Service** → connect the repo.
3. **Build Command**: `npm install`
   **Start Command**: `node server.js` (Render also auto-detects the `Procfile`)
4. Environment variables:
   - `NODE_ENV` = `production`
   - `GEMINI_API_KEY` = your key
   - `CORS_ALLOWED_ORIGINS` = your Render URL, e.g. `https://your-app.onrender.com` (only needed if you call the API from a *different* domain than the one serving the frontend — same-origin requests don't need it)
5. Deploy, then visit the URL Render gives you.

Note: like the Django version, SQLite on most free hosts is **ephemeral**
— the database resets on redeploy. Fine for this demo.

## Endpoints

- `GET /` — booking form (manual.html)
- `GET /Ai` — AI recommendation page (Ai.html)
- `GET /train_static_list` — hardcoded train list (used by the frontend)
- `GET /trains` — DB-backed train list (seeded from the same data)
- `POST /api/ai-recommendation` — Gemini-generated seat explanation, body:
  ```json
  { "train_name": "...", "from_station": "...", "to_station": "...", "seats": [...], "preferences": {...} }
  ```
