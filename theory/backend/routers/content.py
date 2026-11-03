from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from lib.auth import get_current_admin
from lib.db import db
from models.tkj import SiteContent, SiteContentInput, Stats

router = APIRouter(tags=["content"])


@router.get("/content/{key}", response_model=SiteContent)
async def get_content(key: str):
    """Public: always returns a doc (empty data when never edited) so pages never 404."""
    doc = await db.site_content.find_one({"key": key})
    if not doc:
        return SiteContent(key=key)
    return SiteContent(**doc)


@router.put("/content/{key}", response_model=SiteContent)
async def put_content(
    key: str, input: SiteContentInput, _admin: dict = Depends(get_current_admin)
):
    now = datetime.now(timezone.utc)
    await db.site_content.update_one(
        {"key": key}, {"$set": {"data": input.data, "updated_at": now}}, upsert=True
    )
    doc = await db.site_content.find_one({"key": key})
    return SiteContent(**doc)  # type: ignore[arg-type]


@router.get("/stats", response_model=Stats)
async def get_stats():
    return Stats(
        members=await db.members.count_documents({}),
        activities=await db.activities.count_documents({}),
        projects=await db.projects.count_documents({}),
    )
