import os
from functools import lru_cache
from typing import Any

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SUPABASE_URL: str = "https://your-project-ref.supabase.co"
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    DATABASE_URL: str = ""
    LANGGRAPH_CHECKPOINT_DB_URL: str = ""

    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"
    ORCHESTRATOR_QUEUE_NAME: str = "orchestrator"

    AI_SETTINGS_ENCRYPTION_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    GROQ_DEFAULT_MODEL: str = "llama-3.3-70b-versatile"
    GEMINI_PLANNER_MODEL: str = "gemini-2.5-flash-lite"
    GEMINI_ANALYZER_MODEL: str = "gemini-2.5-flash-lite"
    GEMINI_WRITER_MODEL: str = "gemini-2.5-flash-lite"
    GEMINI_EMBEDDING_MODEL: str = "models/gemini-embedding-001"
    GEMINI_EMBEDDING_DIMENSIONS: int = 1536

    RETRIEVAL_MATCH_THRESHOLD: float = 0.5
    RETRIEVAL_MATCH_COUNT: int = 8
    REPORT_TITLE_PREFIX: str = Field(default="Research Report")

    LANGSMITH_TRACING: bool = False
    LANGSMITH_API_KEY: str = ""
    LANGSMITH_PROJECT: str = "lumina-research-orchestrator"
    LANGSMITH_ENDPOINT: str = "https://api.smith.langchain.com"

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore"
    )

    @field_validator("LANGGRAPH_CHECKPOINT_DB_URL")
    @classmethod
    def default_checkpoint_url(cls, value: str, info: Any) -> str:
        return value or info.data.get("DATABASE_URL", "")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()


def configure_langsmith_env() -> None:
    os.environ.setdefault("LANGSMITH_TRACING", str(settings.LANGSMITH_TRACING).lower())
    os.environ.setdefault(
        "LANGCHAIN_TRACING_V2", str(settings.LANGSMITH_TRACING).lower()
    )
    if settings.LANGSMITH_API_KEY:
        os.environ.setdefault("LANGSMITH_API_KEY", settings.LANGSMITH_API_KEY)
    if settings.LANGSMITH_PROJECT:
        os.environ.setdefault("LANGSMITH_PROJECT", settings.LANGSMITH_PROJECT)
    if settings.LANGSMITH_ENDPOINT:
        os.environ.setdefault("LANGSMITH_ENDPOINT", settings.LANGSMITH_ENDPOINT)


configure_langsmith_env()
