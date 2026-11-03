from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from lib.auth import get_current_admin
from lib.db import db
from models.tkj import Project, ProjectInput

router = APIRouter(tags=["projects"])


@router.get("/projects", response_model=list[Project])
async def list_projects():
    docs = (
        await db.projects.find()
        .sort([("date", -1), ("created_at", -1)])
        .to_list(1000)
    )
    return [Project(**doc) for doc in docs]


@router.get("/projects/{id}", response_model=Project)
async def get_project(id: str):
    doc = await db.projects.find_one({"id": id})
    if not doc:
        raise HTTPException(status_code=404, detail="Projek tidak ditemukan")
    return Project(**doc)


@router.post("/projects", response_model=Project, status_code=201)
async def create_project(input: ProjectInput, _admin: dict = Depends(get_current_admin)):
    project = Project(**input.model_dump())
    await db.projects.insert_one(project.model_dump())
    return project


@router.put("/projects/{id}", response_model=Project)
async def update_project(
    id: str, input: ProjectInput, _admin: dict = Depends(get_current_admin)
):
    doc = await db.projects.find_one({"id": id})
    if not doc:
        raise HTTPException(status_code=404, detail="Projek tidak ditemukan")
    updated = Project(
        **{**doc, **input.model_dump(exclude={"attachments"}), "attachments": [
            a.model_dump() for a in input.attachments
        ]}
    )
    await db.projects.replace_one({"id": id}, updated.model_dump())
    return updated


@router.delete("/projects/{id}", status_code=204)
async def delete_project(id: str, _admin: dict = Depends(get_current_admin)):
    result = await db.projects.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Projek tidak ditemukan")
