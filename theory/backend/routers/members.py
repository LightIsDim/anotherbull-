from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from lib.auth import get_current_admin
from lib.db import db
from models.tkj import Member, MemberInput

router = APIRouter(tags=["members"])


@router.get("/members", response_model=list[Member])
async def list_members():
    docs = (
        await db.members.find()
        .sort([("angkatan", 1), ("full_name", 1)])
        .to_list(1000)
    )
    return [Member(**doc) for doc in docs]


@router.get("/members/{id}", response_model=Member)
async def get_member(id: str):
    doc = await db.members.find_one({"id": id})
    if not doc:
        raise HTTPException(status_code=404, detail="Anggota tidak ditemukan")
    return Member(**doc)


@router.post("/members", response_model=Member, status_code=201)
async def create_member(input: MemberInput, _admin: dict = Depends(get_current_admin)):
    member = Member(**input.model_dump())
    await db.members.insert_one(member.model_dump())
    return member


@router.put("/members/{id}", response_model=Member)
async def update_member(
    id: str, input: MemberInput, _admin: dict = Depends(get_current_admin)
):
    doc = await db.members.find_one({"id": id})
    if not doc:
        raise HTTPException(status_code=404, detail="Anggota tidak ditemukan")
    updated = Member(**{**doc, **input.model_dump()})
    await db.members.replace_one({"id": id}, updated.model_dump())
    return updated


@router.delete("/members/{id}", status_code=204)
async def delete_member(id: str, _admin: dict = Depends(get_current_admin)):
    result = await db.members.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Anggota tidak ditemukan")
