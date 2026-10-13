import hashlib
import json
import secrets
import time
import smtplib
from urllib.parse import urlencode
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.config import APP_ENV, GOOGLE_CLIENT_ID
from app.database import SessionLocal
from app.models.auth import PasswordResetToken, User
from app.schemas.auth import EmailRequest, GoogleCredentialRequest, LoginRequest, RegisterRequest, ResetPasswordRequest
from app.services.email import send_reset_email
from app.services.security import hash_password, make_session, verify_password


router = APIRouter(prefix="/api/auth", tags=["authentication"])


def get_db():
    with SessionLocal() as db:
        yield db


@router.get("/me")
def current_user(user: User = Depends(get_current_user)):
    return {"id": user.id, "name": user.name, "email": user.email}


@router.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    user = User(name=body.name.strip(), email=str(body.email).strip().lower(), password_hash=hash_password(body.password), created_at=int(time.time()))
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="An account with this email already exists. Try logging in.")
    return make_session(user)


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == str(body.email).strip().lower()))
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")
    return make_session(user)


@router.post("/forgot-password")
def forgot_password(body: EmailRequest, db: Session = Depends(get_db)):
    email = str(body.email).strip().lower()
    user = db.scalar(select(User).where(User.email == email))
    if not user:
        return {"message": "If an account exists for that email, reset instructions are on their way."}
    token = secrets.token_urlsafe(32)
    db.execute(delete(PasswordResetToken).where(PasswordResetToken.user_id == user.id))
    db.add(PasswordResetToken(token_hash=hashlib.sha256(token.encode()).hexdigest(), user_id=user.id, expires_at=int(time.time()) + 1800))
    db.commit()
    try:
        sent = send_reset_email(user.email, user.name, token)
    except (OSError, smtplib.SMTPException, KeyError):
        raise HTTPException(status_code=503, detail="Email delivery is unavailable. Please try again later.")
    result = {"message": "If an account exists for that email, reset instructions are on their way."}
    if not sent and APP_ENV != "production":
        result["dev_reset_token"] = token
    return result


@router.post("/reset-password")
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    digest = hashlib.sha256(body.token.encode()).hexdigest()
    row = db.get(PasswordResetToken, digest)
    if not row or row.expires_at < int(time.time()):
        if row:
            db.delete(row)
            db.commit()
        raise HTTPException(status_code=400, detail="This reset link is invalid or has expired. Request a new one.")
    user = db.get(User, row.user_id)
    user.password_hash = hash_password(body.password)
    db.execute(delete(PasswordResetToken).where(PasswordResetToken.user_id == row.user_id))
    db.commit()
    return {"message": "Password updated. You can now log in with your new password."}


@router.post("/google")
def google_login(body: GoogleCredentialRequest, db: Session = Depends(get_db)):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=503, detail="Google sign-in is not configured. Add GOOGLE_CLIENT_ID to backend/.env.")
    request = Request(
        "https://oauth2.googleapis.com/tokeninfo?" + urlencode({"id_token": body.credential}),
        headers={"Accept": "application/json"},
    )
    try:
        with urlopen(request, timeout=8) as response:
            claims = json.loads(response.read())
    except HTTPError as error:
        if error.code < 500:
            raise HTTPException(status_code=401, detail="Google could not verify this sign-in. Please try again.") from error
        raise HTTPException(status_code=503, detail="Google sign-in verification is temporarily unavailable. Please try again.") from error
    except (URLError, TimeoutError, OSError) as error:
        raise HTTPException(
            status_code=503,
            detail=(
                "Google sign-in is temporarily unreachable from the backend. "
                "Allow outbound HTTPS access to oauth2.googleapis.com (port 443) "
                "and check the HTTPS proxy or firewall, then try again."
            ),
        ) from error
    except (json.JSONDecodeError, UnicodeDecodeError) as error:
        raise HTTPException(status_code=502, detail="Google returned an invalid sign-in verification response. Please try again.") from error
    email_verified = isinstance(claims, dict) and (
        claims.get("email_verified") is True or claims.get("email_verified") == "true"
    )
    if (
        not isinstance(claims, dict)
        or claims.get("aud") != GOOGLE_CLIENT_ID
        or not email_verified
        or not isinstance(claims.get("email"), str)
        or not claims["email"].strip()
        or not isinstance(claims.get("sub"), str)
        or not claims["sub"].strip()
    ):
        raise HTTPException(status_code=401, detail="Google could not verify this sign-in. Please try again.")
    email = claims["email"].strip().lower()
    display_name = claims.get("name")
    if not isinstance(display_name, str) or not display_name.strip():
        display_name = email.split("@", 1)[0]
    user = db.scalar(select(User).where(User.email == email))
    if not user:
        user = User(name=display_name[:80], email=email, created_at=int(time.time()))
        db.add(user)
        db.commit()
        db.refresh(user)
    return make_session(user)
