from typing import Any, Dict, Optional, Union
from fastapi.responses import JSONResponse
from pydantic import BaseModel


class APIResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    message: str = "Operation successful"
    errors: Optional[Any] = None


def success_response(
    data: Any = None,
    message: str = "Operation successful",
    status_code: int = 200
) -> JSONResponse:
    """Generates a standardized success JSON response."""
    content = {
        "success": True,
        "data": data,
        "message": message,
        "errors": None
    }
    return JSONResponse(status_code=status_code, content=content)


def error_response(
    message: str = "An error occurred",
    errors: Any = None,
    status_code: int = 400
) -> JSONResponse:
    """Generates a standardized error JSON response."""
    content = {
        "success": False,
        "data": None,
        "message": message,
        "errors": errors
    }
    return JSONResponse(status_code=status_code, content=content)
