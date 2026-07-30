from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user_id, get_db
from app.schemas.insight import AIInsightCreate, AIInsightResponse
from app.services.insight_service import insight_service
from app.utils.response import success_response

router = APIRouter(prefix="/ai-insights", tags=["AI Insights"])


@router.get("", response_model=None)
async def list_insights(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve AI insights generated for current user."""
    items = await insight_service.get_user_insights(db, user_id=user_id, skip=skip, limit=limit)
    response_data = [AIInsightResponse.model_validate(item).model_dump(mode="json") for item in items]
    return success_response(data=response_data, message="AI insights retrieved successfully")


@router.get("/{insight_id}", response_model=None)
async def get_insight(
    insight_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve a specific AI insight by ID."""
    item = await insight_service.get_insight_by_id(db, insight_id=insight_id, user_id=user_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="AI insight not found")
    return success_response(data=AIInsightResponse.model_validate(item).model_dump(mode="json"), message="AI insight retrieved successfully")


@router.post("", response_model=None, status_code=status.HTTP_201_CREATED)
async def create_insight(
    obj_in: AIInsightCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Create a new AI insight entry."""
    item = await insight_service.create_insight(db, user_id=user_id, obj_in=obj_in)
    return success_response(
        data=AIInsightResponse.model_validate(item).model_dump(mode="json"),
        message="AI insight created successfully",
        status_code=status.HTTP_201_CREATED
    )


@router.delete("/{insight_id}", response_model=None)
async def delete_insight(
    insight_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Delete an AI insight record."""
    item = await insight_service.delete_insight(db, insight_id=insight_id, user_id=user_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="AI insight not found")
    return success_response(message="AI insight deleted successfully")
