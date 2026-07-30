from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user_id, get_db
from app.schemas.investment import InvestmentCreate, InvestmentResponse, InvestmentUpdate
from app.services.investment_service import investment_service
from app.utils.response import success_response

router = APIRouter(prefix="/investments", tags=["Investments"])


@router.get("", response_model=None)
async def list_investments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all investments for current user."""
    items = await investment_service.get_user_investments(db, user_id=user_id, skip=skip, limit=limit)
    response_data = [InvestmentResponse.model_validate(item).model_dump(mode="json") for item in items]
    return success_response(data=response_data, message="Investments retrieved successfully")


@router.get("/{investment_id}", response_model=None)
async def get_investment(
    investment_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve a specific investment by ID."""
    item = await investment_service.get_investment(db, investment_id=investment_id, user_id=user_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investment record not found")
    return success_response(data=InvestmentResponse.model_validate(item).model_dump(mode="json"), message="Investment retrieved successfully")


@router.post("", response_model=None, status_code=status.HTTP_201_CREATED)
async def create_investment(
    obj_in: InvestmentCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Create a new investment entry."""
    item = await investment_service.create_investment(db, user_id=user_id, obj_in=obj_in)
    return success_response(
        data=InvestmentResponse.model_validate(item).model_dump(mode="json"),
        message="Investment created successfully",
        status_code=status.HTTP_201_CREATED
    )


@router.put("/{investment_id}", response_model=None)
async def update_investment(
    investment_id: UUID,
    obj_in: InvestmentUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Update an existing investment record."""
    item = await investment_service.update_investment(db, investment_id=investment_id, user_id=user_id, obj_in=obj_in)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investment record not found")
    return success_response(data=InvestmentResponse.model_validate(item).model_dump(mode="json"), message="Investment updated successfully")


@router.delete("/{investment_id}", response_model=None)
async def delete_investment(
    investment_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Delete an investment record."""
    item = await investment_service.delete_investment(db, investment_id=investment_id, user_id=user_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investment record not found")
    return success_response(message="Investment deleted successfully")
