# AI Train Booking

A Django + DRF train booking demo with an AI-assisted seat recommendation
feature (Google Gemini).

## What was fixed

This project previously worked locally but broke when pushed to GitHub /
run on a real server. The causes:

- **Hardcoded `http://127.0.0.1:8000`** in the frontend `fetch()` calls —
  changed to relative URLs (`/train_static_list`) so they work on any domain.
- **`DEBUG=True`, empty `ALLOWED_HOSTS`, hardcoded `SECRET_KEY`** — now all
  read from environment variables, with safe local defaults.
- **No `requirements.txt`** — a host has no way to know what to `pip install`.
  Added one with pinned versions.
- **No static file serving for production** — added `whitenoise` and
  `STATIC_ROOT` so CSS/JS/admin assets don't 404 once `DEBUG=False`.
- **No `.gitignore`** — `db.sqlite3` and `__pycache__` were being committed.
- **No process file** — added a `Procfile` so hosts like Render/Railway/
  Heroku know how to run migrations and start the app with `gunicorn`.
- **CORS was wide open (`CORS_ALLOW_ALL_ORIGINS = True`) and the middleware
  list had `CommonMiddleware` twice with `CorsMiddleware` in the wrong
  position** — cleaned up and now only permissive while `DEBUG=True`.
- **The Gemini AI view existed but had no URL route and no error
  handling** — wired up at `/api/ai-recommendation`, now reads the API key
  from an env var and fails gracefully (returns a message instead of a
  500) if the key is missing or the call errors.

**Important:** GitHub only stores your code — it does not run Django for
you. You still need to deploy to an actual host. Steps below cover the
common free options.

## Local development

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then fill in values, at least GEMINI_API_KEY if you want AI insights
python manage.py migrate
python manage.py runserver
```

Visit http://127.0.0.1:8000/

## Deploying

### Option A: Render (free tier, easiest)

1. Push this repo to GitHub (see below).
2. On [render.com](https://render.com), **New > Web Service**, connect your
   GitHub repo.
3. Build command: `pip install -r requirements.txt`
   Start command: `python manage.py migrate && python manage.py collectstatic --noinput && gunicorn Ai_TrainBooking.wsgi:application --bind 0.0.0.0:$PORT`
   (Render auto-detects the `Procfile` too, so this is usually optional.)
4. Add environment variables in the Render dashboard:
   - `DJANGO_SECRET_KEY` — any long random string
   - `DJANGO_DEBUG` — `False`
   - `DJANGO_ALLOWED_HOSTS` — `your-app-name.onrender.com`
   - `GEMINI_API_KEY` — your key from https://aistudio.google.com/apikey
5. Deploy. Render's free SQLite disk is ephemeral (data resets on redeploy) —
   fine for a demo, but move to Postgres for anything persistent.

### Option B: Railway / Heroku

Same idea — both read the `Procfile`. Set the same environment variables
in their dashboard (`DJANGO_SECRET_KEY`, `DJANGO_DEBUG=False`,
`DJANGO_ALLOWED_HOSTS=<your-app-domain>`, `GEMINI_API_KEY`).

### Option C: PythonAnywhere

PythonAnywhere doesn't use a `Procfile`; you configure a WSGI app pointing
at `Ai_TrainBooking.wsgi.application` through their web app dashboard, and
set the same environment variables under the "Web" tab's WSGI config file
or a `.env` loaded by `python-dotenv`.

## Pushing to GitHub

```bash
git init
git add .
git commit -m "Fix deployment config: env-based settings, requirements.txt, relative URLs"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

`db.sqlite3` and `__pycache__` are now gitignored, so a fresh clone starts
clean — run `python manage.py migrate` after cloning to recreate the database.
