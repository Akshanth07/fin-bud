from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import SQLAlchemyError
from app.core.logging import logger
from app.utils.response import error_response


def setup_exception_handlers(app: FastAPI) -> None:
    """Registers global exception handlers for the application."""

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        logger.warning(
            "HTTP Exception",
            status_code=exc.status_code,
            detail=exc.detail,
            path=request.url.path
        )
        return error_response(
            message=str(exc.detail),
            status_code=exc.status_code
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.warning(
            "Validation Error",
            errors=exc.errors(),
            path=request.url.path
        )
        return error_response(
            message="Request validation failed",
            errors=exc.errors(),
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
        )

    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
        logger.error(
            "Database Exception",
            error=str(exc),
            path=request.url.path
        )
        return error_response(
            message="A database error occurred",
            errors=str(exc) if app.debug else None,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.error(
            "Unhandled Exception",
            error=str(exc),
            path=request.url.path,
            exc_info=True
        )
        return error_response(
            message="An unexpected server error occurred",
            errors=str(exc) if app.debug else None,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
