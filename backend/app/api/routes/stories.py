import json
import time
from typing import Literal
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field, TypeAdapter, ValidationError
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.config import BACKEND_DIR
from app.database import SessionLocal
from app.models.auth import User
from app.models.stories import Story, StoryComment, StoryLike


router = APIRouter(prefix="/api/stories", tags=["stories"])
UPLOAD_DIR = BACKEND_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_MEDIA_BYTES = 25 * 1024 * 1024
ALLOWED_MEDIA_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
}


class TimelineEvent(BaseModel):
    year: str = Field(min_length=1, max_length=40)
    title: str = Field(min_length=2, max_length=180)
    text: str = Field(min_length=2, max_length=2000)


class BookChapter(BaseModel):
    title: str = Field(min_length=2, max_length=180)
    text: str = Field(min_length=2, max_length=5000)


class CommentRequest(BaseModel):
    body: str = Field(min_length=1, max_length=2000)


def get_db():
    with SessionLocal() as db:
        yield db


def get_story(db: Session, story_id: int) -> Story:
    story = db.get(Story, story_id)
    if story is None:
        raise HTTPException(status_code=404, detail="This history story could not be found.")
    return story


def story_payload(db: Session, story: Story, current_user_id: int) -> dict:
    author = db.get(User, story.author_id)
    like_count = db.scalar(select(func.count()).select_from(StoryLike).where(StoryLike.story_id == story.id)) or 0
    comment_count = db.scalar(select(func.count()).select_from(StoryComment).where(StoryComment.story_id == story.id)) or 0
    liked = db.get(StoryLike, (story.id, current_user_id)) is not None
    return {
        "id": story.id,
        "format": story.format,
        "title": story.title,
        "body": story.body,
        "era": story.era,
        "place": story.place,
        "year": story.year,
        "chapters": story.chapters or [],
        "timeline_events": [
            {
                **event,
                "media_url": f"/uploads/{event['media_path']}" if event.get("media_path") else None,
            }
            for event in story.timeline_events or []
        ],
        "media_url": f"/uploads/{story.media_path}" if story.media_path else None,
        "media_type": story.media_type,
        "views": story.views,
        "likes": like_count,
        "comments_count": comment_count,
        "liked": liked,
        "author": {"id": author.id, "name": author.name},
        "created_at": story.created_at,
    }


async def save_upload(upload: UploadFile | None) -> tuple[str | None, str | None]:
    if upload is None:
        return None, None
    content_type = (upload.content_type or "").lower()
    extension = ALLOWED_MEDIA_TYPES.get(content_type)
    if not extension:
        raise HTTPException(status_code=415, detail="Use a JPG, PNG, WebP, GIF, MP4, WebM, or MOV file.")
    filename = f"{uuid4().hex}{extension}"
    destination = UPLOAD_DIR / filename
    size = 0
    try:
        with destination.open("wb") as file:
            while chunk := await upload.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_MEDIA_BYTES:
                    raise HTTPException(status_code=413, detail="Media files must be 25 MB or smaller.")
                file.write(chunk)
    except Exception:
        destination.unlink(missing_ok=True)
        raise
    finally:
        await upload.close()
    return filename, content_type


@router.get("")
def list_stories(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    stories = db.scalars(select(Story).order_by(Story.created_at.desc(), Story.id.desc()).limit(100)).all()
    return [story_payload(db, story, user.id) for story in stories]


@router.post("")
async def create_story(
    format: Literal["blog", "timeline", "media", "book"] = Form(),
    title: str = Form(min_length=2, max_length=180),
    body: str = Form(default="", max_length=15000),
    era: str = Form(min_length=2, max_length=40),
    place: str = Form(default="", max_length=120),
    year: str = Form(default="", max_length=40),
    timeline_events: str = Form(default="[]"),
    chapters: str = Form(default="[]"),
    timeline_media_indexes: str = Form(default="[]"),
    media: UploadFile | None = File(default=None),
    event_media: list[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        events = TypeAdapter(list[TimelineEvent]).validate_python(json.loads(timeline_events))
        book_chapters = TypeAdapter(list[BookChapter]).validate_python(json.loads(chapters))
        media_indexes = json.loads(timeline_media_indexes)
        if not isinstance(media_indexes, list) or any(not isinstance(index, int) for index in media_indexes):
            raise ValueError("Timeline image indexes must be a list of event indexes.")
    except (json.JSONDecodeError, ValidationError, ValueError):
        raise HTTPException(status_code=422, detail="Add valid dates and descriptions to each timeline moment and valid titles and text to each chapter.")
    if format == "timeline" and len(events) < 2:
        raise HTTPException(status_code=422, detail="A visual timeline needs at least two moments.")
    if format == "book" and not book_chapters:
        raise HTTPException(status_code=422, detail="A book needs at least one completed chapter.")
    if format == "media" and media is None:
        raise HTTPException(status_code=422, detail="Choose an image or video for your media story.")
    if not title.strip() or not era.strip() or (format != "book" and not body.strip()):
        raise HTTPException(status_code=422, detail="Add a title, story, and era before publishing.")
    if len(media_indexes) != len(event_media) or len(set(media_indexes)) != len(media_indexes) or any(index < 0 or index >= len(events) for index in media_indexes):
        raise HTTPException(status_code=422, detail="Each timeline image must be attached to a valid timeline moment.")
    if format != "timeline" and event_media:
        raise HTTPException(status_code=422, detail="Timeline moment images can only be added to a visual timeline.")
    if format != "book" and book_chapters:
        raise HTTPException(status_code=422, detail="Book chapters can only be added to a Book Mode story.")

    media_path = None
    uploaded_event_paths = []
    event_media_by_index = {}
    try:
        media_path, media_type = await save_upload(media)
        for index, upload in zip(media_indexes, event_media):
            event_path, event_type = await save_upload(upload)
            uploaded_event_paths.append(event_path)
            event_media_by_index[index] = {"media_path": event_path, "media_type": event_type}
    except Exception:
        if media_path:
            (UPLOAD_DIR / media_path).unlink(missing_ok=True)
        for path in uploaded_event_paths:
            if path:
                (UPLOAD_DIR / path).unlink(missing_ok=True)
        raise
    story = Story(
        author_id=user.id,
        format=format,
        title=title.strip(),
        body=body.strip(),
        era=era.strip(),
        place=place.strip(),
        year=year.strip(),
        timeline_events=[
            {
                **event.model_dump(),
                **event_media_by_index.get(index, {"media_path": None, "media_type": None}),
            }
            for index, event in enumerate(events)
        ] if format == "timeline" else None,
        chapters=[chapter.model_dump() for chapter in book_chapters] if format == "book" else None,
        media_path=media_path,
        media_type=media_type,
        views=0,
        created_at=int(time.time()),
    )
    try:
        db.add(story)
        db.commit()
        db.refresh(story)
    except Exception:
        db.rollback()
        if media_path:
            (UPLOAD_DIR / media_path).unlink(missing_ok=True)
        for path in uploaded_event_paths:
            if path:
                (UPLOAD_DIR / path).unlink(missing_ok=True)
        raise
    return story_payload(db, story, user.id)


@router.get("/{story_id}")
def read_story(story_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    story = get_story(db, story_id)
    story.views += 1
    db.commit()
    result = story_payload(db, story, user.id)
    comments = db.execute(
        select(StoryComment, User.name)
        .join(User, User.id == StoryComment.user_id)
        .where(StoryComment.story_id == story.id)
        .order_by(StoryComment.created_at.asc(), StoryComment.id.asc())
    ).all()
    result["comments"] = [
        {"id": comment.id, "body": comment.body, "author": name, "created_at": comment.created_at}
        for comment, name in comments
    ]
    return result


@router.post("/{story_id}/like")
def toggle_like(story_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    get_story(db, story_id)
    like = db.get(StoryLike, (story_id, user.id))
    if like:
        db.delete(like)
    else:
        db.add(StoryLike(story_id=story_id, user_id=user.id, created_at=int(time.time())))
    db.commit()
    return {
        "liked": like is None,
        "likes": db.scalar(select(func.count()).select_from(StoryLike).where(StoryLike.story_id == story_id)) or 0,
    }


@router.post("/{story_id}/comments")
def add_comment(
    story_id: int,
    body: CommentRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    get_story(db, story_id)
    comment_body = body.body.strip()
    if not comment_body:
        raise HTTPException(status_code=422, detail="Write a comment before posting.")
    comment = StoryComment(story_id=story_id, user_id=user.id, body=comment_body, created_at=int(time.time()))
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return {"id": comment.id, "body": comment.body, "author": user.name, "created_at": comment.created_at}
