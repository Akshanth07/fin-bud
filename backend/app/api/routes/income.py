from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user_id, get_db
from app.schemas.income import IncomeSourceCreate, IncomeSourceResponse, IncomeSourceUpdate
from app.services.income_service import income_service
from app.utils.response import success_response

router = APIRouter(tags=["Income Sources"])


@router.get("", response_model=None)
async def list_income_sources(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all income sources for current user."""
    items = await income_service.get_user_income_sources(db, user_id=user_id, skip=skip, limit=limit)
    response_data = [IncomeSourceResponse.model_validate(item).model_dump(mode="json") for item in items]
    return success_response(data=response_data, message="Income sources retrieved successfully")


@router.get("/{income_id}", response_model=None)
async def get_income_source(
    income_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve a specific income source by ID."""
    item = await income_service.get_income_source(db, income_id=income_id, user_id=user_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income source record not found")
    return success_response(data=IncomeSourceResponse.model_validate(item).model_dump(mode="json"), message="Income source retrieved successfully")


@router.post("", response_model=None, status_code=status.HTTP_201_CREATED)
async def create_income_source(
    obj_in: IncomeSourceCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Create a new income source entry."""
    item = await income_service.create_income_source(db, user_id=user_id, obj_in=obj_in)
    return success_response(
        data=IncomeSourceResponse.model_validate(item).model_dump(mode="json"),
        message="Income source created successfully",
        status_code=status.HTTP_201_CREATED
    )


@router.put("/{income_id}", response_model=None)
async def update_income_source(
    income_id: UUID,
    obj_in: IncomeSourceUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Update an existing income source record."""
    item = await income_service.update_income_source(db, income_id=income_id, user_id=user_id, obj_in=obj_in)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income source record not found")
    return success_response(data=IncomeSourceResponse.model_validate(item).model_dump(mode="json"), message="Income source updated successfully")


@router.delete("/{income_id}", response_model=None)
async def delete_income_source(
    income_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Delete an income source record."""
    item = await income_service.delete_income_source(db, income_id=income_id, user_id=user_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income source record not found")
    return success_response(message="Income source deleted successfully")
