from sqlalchemy import BigInteger, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Story(Base):
    __tablename__ = "stories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    format: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    era: Mapped[str] = mapped_column(String(40), nullable=False)
    place: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    year: Mapped[str] = mapped_column(String(40), nullable=False, default="")
    timeline_events: Mapped[list[dict] | None] = mapped_column(JSON, nullable=True)
    chapters: Mapped[list[dict] | None] = mapped_column(JSON, nullable=True)
    media_path: Mapped[str | None] = mapped_column(String(255), nullable=True)
    media_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    views: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[int] = mapped_column(BigInteger, nullable=False)


class StoryLike(Base):
    __tablename__ = "story_likes"

    story_id: Mapped[int] = mapped_column(ForeignKey("stories.id", ondelete="CASCADE"), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    created_at: Mapped[int] = mapped_column(BigInteger, nullable=False)


class StoryComment(Base):
    __tablename__ = "story_comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    story_id: Mapped[int] = mapped_column(ForeignKey("stories.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    body: Mapped[str] = mapped_column(String(2000), nullable=False)
    created_at: Mapped[int] = mapped_column(BigInteger, nullable=False)
