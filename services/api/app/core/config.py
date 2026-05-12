from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "Lumina Research API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    # local host
    API_HOST: str = "127.0.0.1"
    API_PORT: int = 8000

    # Supabase settings for JWT validation
    SUPABASE_URL: str = "https://your-project-ref.supabase.co"
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = (
        "your-super-secret-jwt-token-with-at-least-32-characters-long" 
    )

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # Storage
    SUPABASE_STORAGE_BUCKET: str = "sources"

    # Queue settings (Celery + Redis)
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"
    WORKER_QUEUE_NAME: str = "worker"
    ORCHESTRATOR_QUEUE_NAME: str = "orchestrator"
    WORKER_INGEST_TASK: str = "worker.tasks.ingestion.process_source"
    ORCHESTRATOR_RUN_TASK: str = "orchestrator.tasks.runs.start_run"
    ORCHESTRATOR_RESUME_TASK: str = "orchestrator.tasks.runs.resume_run"

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore"
    )


settings = Settings()
