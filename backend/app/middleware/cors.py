from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings


def setup_cors(app: FastAPI) -> None:
    """Configures CORS middleware for the FastAPI application."""
    origins = [str(origin) for origin in settings.BACKEND_CORS_ORIGINS]

    dev_origins = [
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:3001", "http://127.0.0.1:3001",
        "http://localhost:3002", "http://127.0.0.1:3002",
        "http://localhost:5173", "http://127.0.0.1:5173",
    ]
    for do in dev_origins:
        if do not in origins:
            origins.append(do)

    clean_origins = [o for o in origins if o != "*"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=clean_origins if clean_origins else ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


