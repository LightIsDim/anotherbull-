"""Pydantic v2 models for the penjilat site.

Mirror every change here in frontend/src/types.ts in the same edit — nothing
infers across the Python/TypeScript boundary.
"""

import uuid
from datetime import datetime, timezone

from pydantic import BaseModel, Field


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    # Aware UTC on write so Pydantic serialises an offset and JS Date parses it.
    return datetime.now(timezone.utc)


class LoginRequest(BaseModel):
    username: str
    password: str


class AdminUser(BaseModel):
    id: str = Field(default_factory=_uuid)
    username: str


class Activity(BaseModel):
    id: str = Field(default_factory=_uuid)
    title: str
    description: str = ""
    date: str = ""  # YYYY-MM-DD
    category: str = "Kegiatan"
    photos: list[str] = []
    created_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(default_factory=_now)


class ActivityInput(BaseModel):
    title: str = Field(min_length=1)
    description: str = ""
    date: str = ""
    category: str = "Kegiatan"
    photos: list[str] = []


class Leader(BaseModel):
    id: str = Field(default_factory=_uuid)
    name: str
    position: str
    duties: str = ""
    period: str = ""
    photo: str = ""
    order: int = 0
    created_at: datetime = Field(default_factory=_now)


class LeaderInput(BaseModel):
    name: str = Field(min_length=1)
    position: str = Field(min_length=1)
    duties: str = ""
    period: str = ""
    photo: str = ""
    order: int = 0


class Member(BaseModel):
    id: str = Field(default_factory=_uuid)
    full_name: str
    nickname: str = ""
    angkatan: str = ""
    year: int = 0
    status: str = "Anggota"
    skills: list[str] = []
    description: str = ""
    photo: str = ""
    created_at: datetime = Field(default_factory=_now)


class MemberInput(BaseModel):
    full_name: str = Field(min_length=1)
    nickname: str = ""
    angkatan: str = ""
    year: int = 0
    status: str = "Anggota"
    skills: list[str] = []
    description: str = ""
    photo: str = ""


class Attachment(BaseModel):
    name: str
    url: str


class Project(BaseModel):
    id: str = Field(default_factory=_uuid)
    title: str
    description: str = ""
    date: str = ""
    category: str = "Lainnya"
    team: str = ""
    tech: list[str] = []
    photos: list[str] = []
    attachments: list[Attachment] = []
    created_at: datetime = Field(default_factory=_now)


class ProjectInput(BaseModel):
    title: str = Field(min_length=1)
    description: str = ""
    date: str = ""
    category: str = "Lainnya"
    team: str = ""
    tech: list[str] = []
    photos: list[str] = []
    attachments: list[Attachment] = []


class SiteContent(BaseModel):
    key: str
    data: dict[str, str] = {}
    updated_at: datetime = Field(default_factory=_now)


class SiteContentInput(BaseModel):
    data: dict[str, str]


class Stats(BaseModel):
    members: int
    activities: int
    projects: int


class PasswordChangeInput(BaseModel):
    old_password: str
    new_password: str = Field(min_length=8)