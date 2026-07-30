from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api.router import api_router
from app.api.routes.health import router as health_router
from app.core.config import settings
from app.core.logging import logger, setup_logging
from app.middleware.cors import setup_cors
from app.middleware.error_handler import setup_exception_handlers
from app.middleware.logging_middleware import RequestLoggingMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events lifecycle manager."""
    setup_logging()
    logger.info(
        "Starting FinancialOS FastAPI Backend",
        app_name=settings.APP_NAME,
        version=settings.VERSION,
        environment=settings.APP_ENV
    )
    yield
    logger.info("Shutting down FinancialOS FastAPI Backend")


app = FastAPI(
    title=settings.APP_NAME,
    description="Production-ready FastAPI backend powering FinancialOS personal finance platform.",
    version=settings.VERSION,
    debug=settings.DEBUG,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Setup CORS Middleware
setup_cors(app)

# Setup Request Timing & Logging Middleware
app.add_middleware(RequestLoggingMiddleware)

# Setup Global Exception Handlers
setup_exception_handlers(app)

# Include top-level Health router (GET /health)
app.include_router(health_router)

# Include API Router under /api/v1 prefix
app.include_router(api_router, prefix=settings.API_V1_STR)

# Also mount under /api prefix for Next.js frontend proxy (NEXT_PUBLIC_API_URL=http://localhost:8000/api)
app.include_router(api_router, prefix="/api")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
