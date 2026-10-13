from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select

from app.database import SessionLocal
from app.models.auth import User
from app.services.security import decode_session


bearer = HTTPBearer(auto_error=False)


def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)) -> User:
    claims = decode_session(credentials.credentials) if credentials else None
    if not claims:
        raise HTTPException(status_code=401, detail="Please log in to continue.")
    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.id == claims.get("sub")))
        if user is None:
            raise HTTPException(status_code=401, detail="This account session is no longer valid. Please log in again.")
        db.expunge(user)
        return user
