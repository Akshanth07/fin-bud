from uuid import UUID
from fastapi import APIRouter, Depends, Path
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_current_user_id, get_db
from app.services.dashboard_service import dashboard_service
from app.utils.response import success_response

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
async def get_dashboard_summary(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Get dynamic aggregated dashboard metrics calculated from user financial records.
    Never stores calculated numbers directly in the database.
    """
    summary = await dashboard_service.get_user_dashboard_summary(db, user_id)
    return success_response(
        data=summary,
        message="Dashboard summary calculated successfully"
    )


@router.get("/charts/{chart_type}")
async def get_dashboard_chart(
    chart_type: str = Path(..., description="income-vs-expenses, assets-by-category, liabilities-by-category, asset-allocation, monthly-cashflow"),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get aggregated chart data series for dashboard frontend visualizations."""
    chart_data = await dashboard_service.get_chart_data(db, user_id=user_id, chart_type=chart_type)
    return success_response(
        data=chart_data,
        message=f"Chart data for {chart_type} generated successfully"
    )
