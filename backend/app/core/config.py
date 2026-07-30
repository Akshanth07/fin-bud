import json
import logging
from typing import List, Union
from pydantic import AnyHttpUrl, Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)

_PLACEHOLDER_SECRETS = frozenset({
    "", "financialos-dev-super-secret-key-32-bytes-minimum",
    "financialos-jwt-secret-placeholder", "your-supabase-jwt-secret",
})


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    APP_NAME: str = "FinancialOS API"
    APP_ENV: str = "development"
    DEBUG: bool = True
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "financialos-dev-super-secret-key-32-bytes-minimum"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres"

    # Supabase Auth
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    SUPABASE_ALGORITHM: str = "HS256"

    # External APIs
    GROQ_API_KEY: str = Field(default="", description="Groq AI API Key")
    GROQ_MODEL: str = Field(default="llama-3.3-70b-versatile", description="Groq AI LLM Model")
    MARKETAUX_API_KEY: str = ""
    FINNHUB_API_KEY: str = ""

    # CORS Origins
    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:3001", "http://127.0.0.1:3001",
        "http://localhost:3002", "http://127.0.0.1:3002",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str) and v.startswith("["):
            try:
                return json.loads(v)
            except Exception:
                return ["http://localhost:3000", "http://localhost:3001"]
        elif isinstance(v, list):
            return v
        return ["http://localhost:3000", "http://localhost:3001"]

    @model_validator(mode="after")
    def _enforce_production_secrets(self) -> "Settings":
        """Fail-fast: refuse to start in production without real secrets."""
        if self.APP_ENV == "production":
            if self.SUPABASE_JWT_SECRET in _PLACEHOLDER_SECRETS:
                raise ValueError(
                    "CRITICAL: SUPABASE_JWT_SECRET must be set to a real value in production. "
                    "The application will not start without a valid JWT secret."
                )
            if self.SECRET_KEY in _PLACEHOLDER_SECRETS:
                raise ValueError(
                    "CRITICAL: SECRET_KEY must be set to a strong random value in production."
                )
            # Force-disable debug mode and API docs in production
            self.DEBUG = False
        return self


settings = Settings()
