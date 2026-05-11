import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.security import get_current_user, TokenPayload
from app.api.router import api_router
from app.api.endpoints import health


def main():
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
    )

    # Set up CORS
    if settings.BACKEND_CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    app.include_router(health.router)

    @app.get("/api/v1/me")
    def read_users_me(current_user: TokenPayload = Depends(get_current_user)):
        return {"user_id": current_user.sub, "role": current_user.role}

    app.include_router(api_router, prefix=settings.API_V1_STR)

    uvicorn.run(app, host=settings.API_HOST, port=settings.API_PORT)


if __name__ == "__main__":
    main()
