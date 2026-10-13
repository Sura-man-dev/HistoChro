# Chronicle API

FastAPI authentication API. Routes, database setup, models, request schemas, and
security helpers are separated under `app/`; `main.py` remains the Uvicorn entry
point.

## Project layout

```text
backend/
  app/
    api/routes/auth.py       # register, login, reset, Google credential, profile
    core/config.py           # environment configuration
    models/auth.py           # SQLAlchemy account and reset-token tables
    schemas/auth.py          # validated API request bodies
    services/email.py        # password reset mail
    services/security.py     # password hashes and signed sessions
    database.py              # SQLAlchemy engines and session factory
    main.py                  # FastAPI app and router setup
  main.py                    # `uvicorn main:app` compatibility entry
```

## Configure Neon

1. To use Neon, copy its **pooled** connection string to `DATABASE_URL`.
2. Copy the **direct/unpooled** connection string to `DIRECT_URL`.
3. Copy `backend/.env.example` to `backend/.env` and set `CHRONICLE_SECRET`.
   The example uses local SQLite by default; set the Neon URLs only when you
   want accounts stored in Neon. Keep `.env` private and out of source control.

The pooled URL handles account queries. The direct URL creates the schema when
the API starts. Use Neon’s `psycopg` compatible PostgreSQL URL; the app also
accepts the standard `postgresql://` URL and selects the psycopg driver.

## Start the API

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
# Optional: set DATABASE_URL and DIRECT_URL in .env to use Neon instead of SQLite.
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Check `http://127.0.0.1:8000/api/health`. The frontend’s Vite server proxies
`/api` to this local API. Register and login both use Neon when the Neon URLs
are set; without them the development default is a local SQLite database.
If the health check returns `503`, the backend cannot connect to Neon, and
registration will also fail until the Neon project, connection URLs, and
outbound PostgreSQL access on port `5432` are available.

## Google sign-in setup

This frontend uses Google Identity Services to get an ID token and sends that
token to the FastAPI `/api/auth/google` endpoint for verification. It does not
use an OAuth redirect callback.

In Google Cloud Console, create an OAuth client with application type **Web
application** and set these **Authorized JavaScript origins**:

```text
http://localhost:5173
http://127.0.0.1:5173
```

Add your deployed frontend origin there too, for example
`https://chronicle.example.com`. For this sign-in flow, leave **Authorized
redirect URIs** empty; there is no callback URL to enter. Put the same Web
client ID in `frontend/.env` as `VITE_GOOGLE_CLIENT_ID` and in `backend/.env` as
`GOOGLE_CLIENT_ID`. The frontend Vite server must be restarted after editing
`frontend/.env`. The Google OAuth client must be a **Web application**, and
both development origins must be listed exactly; otherwise Google rejects the
sign-in button with “The given origin is not allowed for the given client ID.”
The API also needs outbound HTTPS access to `oauth2.googleapis.com` on port
443 to verify Google credentials. If Google sign-in reports that verification
is unreachable, allow that destination through the backend machine's firewall
or HTTPS proxy. The client ID in frontend `.env` and backend `.env` must match.

## Production notes

Set `APP_ENV=production`, a random `CHRONICLE_SECRET` with at least 32
characters, the deployed frontend in `FRONTEND_URL` and `CORS_ORIGINS`, and
SMTP settings before enabling password-reset email. Never commit `.env` or
publish database credentials.
