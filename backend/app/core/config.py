import os
from pathlib import Path

from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIR / ".env")


def csv_env(name: str, fallback: str) -> list[str]:
    return [value.strip().rstrip("/") for value in os.getenv(name, fallback).split(",") if value.strip()]


APP_ENV = os.getenv("APP_ENV", "development")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
CORS_ORIGINS = csv_env("CORS_ORIGINS", FRONTEND_URL)
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{(BACKEND_DIR / 'chronicle.sqlite3').as_posix()}")
DIRECT_URL = os.getenv("DIRECT_URL") or None
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "").strip()
JWT_SECRET = os.getenv("CHRONICLE_SECRET", "development-only-change-this-secret")
TOKEN_LIFETIME_SECONDS = 60 * 60 * 24 * 7

if APP_ENV == "production" and (JWT_SECRET == "development-only-change-this-secret" or "replace-with" in JWT_SECRET or len(JWT_SECRET) < 32):
    raise RuntimeError("Set CHRONICLE_SECRET to a random value of at least 32 characters in production.")
