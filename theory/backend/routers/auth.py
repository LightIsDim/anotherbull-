from fastapi import APIRouter, Depends, HTTPException, Response

from lib.auth import (
    clear_session_cookie,
    create_session_token,
    get_current_admin,
    hash_password,
    get_current_admin_or_none,
    set_session_cookie,
    verify_password,
)
from lib.db import db
from models.tkj import AdminUser, LoginRequest, PasswordChangeInput

router = APIRouter(tags=["auth"])


@router.post("/auth/login", response_model=AdminUser)
async def login(input: LoginRequest, response: Response):
    user = await db.users.find_one({"username": input.username})
    if not user or not verify_password(input.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Username atau password salah")
    set_session_cookie(response, create_session_token(user["id"]))
    return AdminUser(id=user["id"], username=user["username"])


@router.post("/auth/logout")
async def logout(response: Response):
    clear_session_cookie(response)
    return {"ok": True}


@router.post("/auth/change-password")
async def change_password(input: PasswordChangeInput, admin: dict = Depends(get_current_admin)):
    """Admin-only: verify the old password server-side, then re-hash and store the new one."""
    if not verify_password(input.old_password, admin.get("password_hash", "")):
        raise HTTPException(status_code=400, detail="Password lama salah")
    await db.users.update_one(
        {"id": admin["id"]}, {"$set": {"password_hash": hash_password(input.new_password)}}
    )
    return {"ok": True}


@router.get("/auth/me", response_model=AdminUser | None)
async def me(admin: dict | None = Depends(get_current_admin_or_none)):
    """200 + null when logged out (keeps the public console clean); 200 AdminUser when logged in."""
    if not admin:
        return None
    return AdminUser(id=admin["id"], username=admin["username"])
