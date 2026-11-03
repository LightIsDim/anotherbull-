from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from lib.auth import get_current_admin
from lib.db import db
from models.tkj import Leader, LeaderInput

router = APIRouter(tags=["leaders"])


@router.get("/leaders", response_model=list[Leader])
async def list_leaders():
    docs = (
        await db.leaders.find().sort([("order", 1), ("name", 1)]).to_list(1000)
    )
    return [Leader(**doc) for doc in docs]


@router.get("/leaders/{id}", response_model=Leader)
async def get_leader(id: str):
    doc = await db.leaders.find_one({"id": id})
    if not doc:
        raise HTTPException(status_code=404, detail="Pengurus tidak ditemukan")
    return Leader(**doc)


@router.post("/leaders", response_model=Leader, status_code=201)
async def create_leader(input: LeaderInput, _admin: dict = Depends(get_current_admin)):
    leader = Leader(**input.model_dump())
    await db.leaders.insert_one(leader.model_dump())
    return leader


@router.put("/leaders/{id}", response_model=Leader)
async def update_leader(
    id: str, input: LeaderInput, _admin: dict = Depends(get_current_admin)
):
    doc = await db.leaders.find_one({"id": id})
    if not doc:
        raise HTTPException(status_code=404, detail="Pengurus tidak ditemukan")
    updated = Leader(**{**doc, **input.model_dump()})
    await db.leaders.replace_one({"id": id}, updated.model_dump())
    return updated


@router.delete("/leaders/{id}", status_code=204)
async def delete_leader(id: str, _admin: dict = Depends(get_current_admin)):
    result = await db.leaders.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pengurus tidak ditemukan")
