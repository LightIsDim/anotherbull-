from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from lib.auth import get_current_admin
from lib.db import db
from models.tkj import Activity, ActivityInput

router = APIRouter(tags=["activities"])


@router.get("/activities", response_model=list[Activity])
async def list_activities():
    docs = await db.activities.find().sort([("date", -1), ("created_at", -1)]).to_list(1000)
    return [Activity(**doc) for doc in docs]


@router.get("/activities/{id}", response_model=Activity)
async def get_activity(id: str):
    doc = await db.activities.find_one({"id": id})
    if not doc:
        raise HTTPException(status_code=404, detail="Kegiatan tidak ditemukan")
    return Activity(**doc)


@router.post("/activities", response_model=Activity, status_code=201)
async def create_activity(input: ActivityInput, _admin: dict = Depends(get_current_admin)):
    activity = Activity(**input.model_dump())
    await db.activities.insert_one(activity.model_dump())
    return activity


@router.put("/activities/{id}", response_model=Activity)
async def update_activity(
    id: str, input: ActivityInput, _admin: dict = Depends(get_current_admin)
):
    doc = await db.activities.find_one({"id": id})
    if not doc:
        raise HTTPException(status_code=404, detail="Kegiatan tidak ditemukan")
    updated = Activity(
        **{**doc, **input.model_dump(), "updated_at": datetime.now(timezone.utc)}
    )
    await db.activities.replace_one({"id": id}, updated.model_dump())
    return updated


@router.delete("/activities/{id}", status_code=204)
async def delete_activity(id: str, _admin: dict = Depends(get_current_admin)):
    result = await db.activities.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Kegiatan tidak ditemukan")
