import mimetypes
import re
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from fastapi.responses import FileResponse

from lib.auth import get_current_admin

router = APIRouter(tags=["uploads"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".webp", ".gif",  # images
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".zip", ".rar", ".txt",  # docs
}
MAX_BYTES = 8 * 1024 * 1024
_SAFE_NAME = re.compile(r"[0-9a-f]{32}\.[a-z0-9]{2,5}")


@router.post("/uploads", status_code=201)
async def upload_file(file: UploadFile, _admin: dict = Depends(get_current_admin)):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=415, detail=f"Tipe file '{ext or 'tidak dikenal'}' tidak diizinkan")
    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Ukuran file maksimal 8 MB")
    name = f"{uuid.uuid4().hex}{ext}"
    (UPLOAD_DIR / name).write_bytes(data)
    return {
        "url": f"/api/files/{name}",
        "name": name,
        "original_name": file.filename,
        "content_type": file.content_type,
    }


@router.get("/files/{name}")
async def serve_file(name: str):
    if not _SAFE_NAME.fullmatch(name):
        raise HTTPException(status_code=400, detail="Nama file tidak valid")
    path = UPLOAD_DIR / name
    if not path.is_file():
        raise HTTPException(status_code=404, detail="File tidak ditemukan")
    media_type = mimetypes.guess_type(name)[0] or "application/octet-stream"
    return FileResponse(path, media_type=media_type, filename=name)
