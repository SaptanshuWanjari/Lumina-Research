from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "Lumina Research API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    # Supabase settings for JWT validation
    SUPABASE_URL: str = "http://localhost:54321"  # Default local Supabase url
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = "your-super-secret-jwt-token-with-at-least-32-characters-long"  # Default for local dev

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore"
    )


settings = Settings()
