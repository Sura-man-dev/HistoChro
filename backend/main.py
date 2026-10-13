"""Compatibility entry point: run with `uvicorn main:app --reload` from backend/."""

from app.main import app

__all__ = ["app"]
