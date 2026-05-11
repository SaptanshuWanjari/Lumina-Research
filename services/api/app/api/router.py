from fastapi import APIRouter
from app.api.endpoints import cases, sources, runs

api_router = APIRouter()
api_router.include_router(cases.router, prefix="/cases", tags=["cases"])
api_router.include_router(sources.router, tags=["sources"])
api_router.include_router(runs.router, tags=["runs"])
