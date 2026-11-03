# MongoDB connection
from lib.db import client, db, ensure_indexes

from routers.activities import router as activities_router
from routers.auth import router as auth_router
from routers.content import router as content_router
from routers.leaders import router as leaders_router
from routers.members import router as members_router
from routers.projects import router as projects_router
from routers.uploads import router as uploads_router
# Include the resource routers (all under /api via api_router's prefix)
api_router.include_router(auth_router)
api_router.include_router(activities_router)
api_router.include_router(leaders_router)
api_router.include_router(members_router)
api_router.include_router(projects_router)
api_router.include_router(content_router)
api_router.include_router(uploads_router)

# Include the router in the main app
app.include_router(api_router)