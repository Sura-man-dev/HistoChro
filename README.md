# Chronicle

Chronicle is a history community with an interactive landing page, a signed-in
member home, and a modular FastAPI account service. Successful login and
registration open the member home. Both the frontend and backend must run for
account creation and login to work.

## Run locally on Windows

Open two PowerShell terminals from the project folder.

### Terminal 1: backend API

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
# The example uses local SQLite, so registration works without Neon.
# To use Neon instead, set DATABASE_URL and DIRECT_URL in backend/.env.
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Keep this terminal open. Confirm the API is available at
`http://127.0.0.1:8000/api/health` and returns `{"status":"ok",...}`.

### Terminal 2: frontend

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL, usually `http://localhost:5173`. Vite forwards `/api`
requests to `http://127.0.0.1:8000`. If registration shows an account-service
unavailable message or Vite logs `ECONNREFUSED`, the backend terminal is not
running or the API is using a different port.

Keep both terminals open while using the site. Confirm the backend terminal
reports that Uvicorn is running at `http://127.0.0.1:8000`, then open
`http://127.0.0.1:8000/api/health`. The health check should return
`{"status":"ok",...}` before you submit the registration form. If the backend
fails during startup, follow the database setup in `backend/README.md` and
check the backend terminal for the database connection error; the frontend
proxy cannot register accounts while the API is stopped.
If the API starts but health returns `503`, check the database error in the
backend terminal. Local SQLite needs no network or Neon credentials. If you
choose Neon, verify that the project is active, `DATABASE_URL` and `DIRECT_URL`
are correct, and your network permits outbound PostgreSQL connections on port
`5432`. Keep real connection strings private.
The API will return the same clear `503` database message during registration
when Neon cannot be reached; a successful health check is required before
accounts can be created.
Google sign-in also requires the same Web application client ID in
`frontend/.env` and `backend/.env`. In Google Cloud Console, authorize both
`http://localhost:5173` and `http://127.0.0.1:5173` as JavaScript origins,
then restart Vite. The backend needs outbound HTTPS access to
`oauth2.googleapis.com`; Google sign-in creates its account in Neon, so Neon
must be reachable as well.

Signed-in members can publish an article, an image/video story, or a visual
timeline at `/create`. Timeline event images and uploaded story media are saved
under `backend/uploads/`; keep this directory on persistent storage when
deploying the API.

## Production build

```powershell
cd frontend
npm run build
```

See `backend/README.md` for Neon, Google sign-in, and production email setup.
