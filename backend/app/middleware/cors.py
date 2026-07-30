from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings


def setup_cors(app: FastAPI) -> None:
    """Configures CORS middleware for the FastAPI application."""
    origins = [str(origin) for origin in settings.BACKEND_CORS_ORIGINS]

    # Filter out wildcard '*' when allow_credentials=True (browsers reject this combo)
    clean_origins = [o for o in origins if o != "*"]
    if not clean_origins:
        clean_origins = ["http://localhost:3000"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=clean_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

