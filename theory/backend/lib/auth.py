"""Admin session auth: pbkdf2 password hashing + JWT httpOnly cookie sessions.

Visitors are read-only; every write route depends on get_current_admin (deny-by-default).
"""

import hashlib
import hmac
import os
import time

import jwt
from fastapi import HTTPException, Request, Response

from lib.db import db

COOKIE_NAME = "tkj_session"
SESSION_TTL_SECONDS = 7 * 24 * 3600
_SECRET = os.environ.get("SESSION_SECRET", "insecure-dev-secret-change-me")


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 390_000)
    return f"pbkdf2_sha256$390000${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _algo, iters, salt_hex, digest_hex = stored.split("$")
        digest = hashlib.pbkdf2_hmac(
            "sha256", password.encode(), bytes.fromhex(salt_hex), int(iters)
        )
        return hmac.compare_digest(digest.hex(), digest_hex)
    except (ValueError, AttributeError):
        return False


def create_session_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": int(time.time()) + SESSION_TTL_SECONDS}
    return jwt.encode(payload, _SECRET, algorithm="HS256")


def decode_session_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, _SECRET, algorithms=["HS256"])
        sub = payload.get("sub")
        return str(sub) if sub else None
    except jwt.PyJWTError:
        return None


def set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        COOKIE_NAME,
        token,
        max_age=SESSION_TTL_SECONDS,
        httponly=True,
        samesite="lax",
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(COOKIE_NAME)


async def get_current_admin(request: Request) -> dict:
    """Re-derive the principal from the source of truth (Mongo), never from a baked claim."""
    user = await get_current_admin_or_none(request)
    if not user:
        raise HTTPException(status_code=401, detail="Autentikasi admin dibutuhkan")
    return user


async def get_current_admin_or_none(request: Request) -> dict | None:
    """Optional variant: /auth/me answers 'who am I' with 200 + null when logged out."""
    token = request.cookies.get(COOKIE_NAME)
    user_id = decode_session_token(token) if token else None
    if user_id:
        user = await db.users.find_one({"id": user_id})
        if user:
            return user
    return None