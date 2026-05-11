from functools import lru_cache
from typing import Any

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SUPABASE_URL: str = "http://localhost:54321"
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    DATABASE_URL: str = ""
    LANGGRAPH_CHECKPOINT_DB_URL: str = ""

    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"

    GOOGLE_API_KEY: str = ""
    GEMINI_PLANNER_MODEL: str = "gemini-2.5-pro"
    GEMINI_ANALYZER_MODEL: str = "gemini-2.5-pro"
    GEMINI_WRITER_MODEL: str = "gemini-2.5-pro"
    GEMINI_EMBEDDING_MODEL: str = "models/gemini-embedding-001"

    RETRIEVAL_MATCH_THRESHOLD: float = 0.5
    RETRIEVAL_MATCH_COUNT: int = 8
    REPORT_TITLE_PREFIX: str = Field(default="Research Report")

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
