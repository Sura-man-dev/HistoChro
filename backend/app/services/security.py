import base64
import hashlib
import hmac
import json
import secrets
import time

from app.core.config import JWT_SECRET, TOKEN_LIFETIME_SECONDS


def hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 310_000)
    return f"{salt.hex()}:{digest.hex()}"


def verify_password(password: str, stored: str | None) -> bool:
    if not stored:
        return False
    try:
        salt_hex, digest_hex = stored.split(":", 1)
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(digest_hex)
        if len(salt) != 16 or len(expected) != hashlib.sha256().digest_size:
            return False
        actual = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 310_000)
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        # Treat malformed or legacy database values as failed credentials, not 500s.
        return False


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def make_session(user) -> dict:
    now = int(time.time())
    header = _b64url(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    payload = _b64url(json.dumps({"sub": user.id, "email": user.email, "name": user.name, "iat": now, "exp": now + TOKEN_LIFETIME_SECONDS}, separators=(",", ":")).encode())
    unsigned = f"{header}.{payload}"
    signature = _b64url(hmac.new(JWT_SECRET.encode(), unsigned.encode(), hashlib.sha256).digest())
    return {"access_token": f"{unsigned}.{signature}", "token_type": "bearer", "user": {"id": user.id, "name": user.name, "email": user.email}}


def decode_session(token: str) -> dict | None:
    try:
        header, payload, signature = token.split(".")
        header_data = json.loads(base64.urlsafe_b64decode(header + "=" * (-len(header) % 4)))
        if not isinstance(header_data, dict) or header_data.get("alg") != "HS256":
            return None
        unsigned = f"{header}.{payload}"
        expected = _b64url(hmac.new(JWT_SECRET.encode(), unsigned.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(signature, expected):
            return None
        padded = payload + "=" * (-len(payload) % 4)
        claims = json.loads(base64.urlsafe_b64decode(padded))
        if not isinstance(claims, dict) or not isinstance(claims.get("exp"), int):
            return None
        return claims if claims["exp"] > int(time.time()) else None
    except (ValueError, TypeError, UnicodeDecodeError, json.JSONDecodeError):
        return None
