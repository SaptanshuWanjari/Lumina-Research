from __future__ import annotations

import os
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SUPABASE_URL: str = "http://localhost:54321"
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_STORAGE_BUCKET: str = "sources"

    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"

    GOOGLE_API_KEY: str = ""
    GEMINI_EMBEDDING_MODEL: str = "models/gemini-embedding-001"
    GEMINI_EMBEDDING_DIMENSIONS: int = 1536

    WORKER_CHUNK_SIZE: int = Field(default=900, ge=200)
    WORKER_CHUNK_OVERLAP: int = Field(default=120, ge=0)
    WORKER_HTTP_TIMEOUT_SECONDS: float = Field(default=20.0, gt=0)
    WORKER_MAX_URL_BYTES: int = Field(default=5_000_000, gt=0)

    LANGSMITH_TRACING: bool = False
    LANGSMITH_API_KEY: str = ""
    LANGSMITH_PROJECT: str = "lumina-research-worker"
    LANGSMITH_ENDPOINT: str = "https://api.smith.langchain.com"

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore"
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()


def configure_langsmith_env() -> None:
    os.environ.setdefault("LANGSMITH_TRACING", str(settings.LANGSMITH_TRACING).lower())
    os.environ.setdefault("LANGCHAIN_TRACING_V2", str(settings.LANGSMITH_TRACING).lower())
    if settings.LANGSMITH_API_KEY:
        os.environ.setdefault("LANGSMITH_API_KEY", settings.LANGSMITH_API_KEY)
    if settings.LANGSMITH_PROJECT:
        os.environ.setdefault("LANGSMITH_PROJECT", settings.LANGSMITH_PROJECT)
    if settings.LANGSMITH_ENDPOINT:
        os.environ.setdefault("LANGSMITH_ENDPOINT", settings.LANGSMITH_ENDPOINT)


configure_langsmith_env()
