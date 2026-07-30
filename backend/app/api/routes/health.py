from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.database import get_db
from app.utils.response import success_response

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Health Check Endpoint.
    Verifies backend status, version, and database connectivity.
    """
    db_status = "connected"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"disconnected: {str(e)}"

    return success_response(
        data={
            "status": "healthy" if db_status == "connected" else "unhealthy",
            "database": db_status,
            "version": settings.VERSION,
            "app_name": settings.APP_NAME,
            "environment": settings.APP_ENV,
        },
        message="Health check completed successfully"
    )
