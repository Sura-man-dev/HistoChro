from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.api.routes.auth import router as auth_router
from app.api.routes.stories import UPLOAD_DIR, router as stories_router
from app.core.config import CORS_ORIGINS
from app.database import engine, init_database


logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        init_database()
    except SQLAlchemyError:
        logger.exception("Neon database initialization failed; the API will remain available for health checks.")
    yield


app = FastAPI(title="Chronicle API", version="1.0.0", lifespan=lifespan)


@app.exception_handler(SQLAlchemyError)
async def database_unavailable(_: Request, error: SQLAlchemyError) -> JSONResponse:
    logger.error(
        "Database operation failed; returning HTTP 503.",
        exc_info=(type(error), error, error.__traceback__),
    )
    return JSONResponse(
        status_code=503,
        content={
            "detail": (
                "Chronicle cannot reach its database. Check that Neon is active, "
                "the backend connection URLs are current, and this network allows "
                "outbound PostgreSQL traffic on port 5432."
            )
        },
        headers={"Retry-After": "5"},
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
app.include_router(auth_router)
app.include_router(stories_router)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/api/health", tags=["health"])
def health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except SQLAlchemyError as error:
        logger.exception("Neon health check failed.")
        raise HTTPException(
            status_code=503,
            detail="The API is running but cannot reach Neon. Check that the Neon project is active, DATABASE_URL is correct, and outbound PostgreSQL traffic on port 5432 is allowed.",
        ) from error
    return {"status": "ok", "service": "chronicle-api", "database": "connected"}
