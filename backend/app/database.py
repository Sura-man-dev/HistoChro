from pathlib import Path

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import BACKEND_DIR, DATABASE_URL, DIRECT_URL


class Base(DeclarativeBase):
    pass


def sqlalchemy_url(url: str) -> str:
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url[len("postgres://"):]
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url[len("postgresql://"):]
    return url


def make_engine(url: str):
    options = {"pool_pre_ping": True}
    normalized = sqlalchemy_url(url)
    if normalized.startswith("sqlite:"):
        options["connect_args"] = {"check_same_thread": False}
    elif normalized.startswith("postgresql+psycopg:"):
        options["connect_args"] = {"connect_timeout": 2}
    return create_engine(normalized, **options)


engine = make_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def init_database() -> None:
    # Import registers every model on Base.metadata before create_all runs.
    from app.models import auth, stories  # noqa: F401

    if DATABASE_URL.startswith("sqlite:"):
        Path(BACKEND_DIR / "chronicle.sqlite3").parent.mkdir(parents=True, exist_ok=True)
    schema_engine = make_engine(DIRECT_URL) if DIRECT_URL else engine
    try:
        Base.metadata.create_all(schema_engine)
        story_columns = {column["name"] for column in inspect(schema_engine).get_columns("stories")}
        if "chapters" not in story_columns:
            with schema_engine.begin() as connection:
                connection.execute(text("ALTER TABLE stories ADD COLUMN chapters JSON"))
    finally:
        if schema_engine is not engine:
            schema_engine.dispose()
