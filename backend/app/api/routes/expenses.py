from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user_id, get_db
from app.schemas.expense import ExpenseCreate, ExpenseResponse, ExpenseUpdate
from app.services.expense_service import expense_service
from app.utils.response import success_response

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.get("", response_model=None)
async def list_expenses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all expense entries for current user."""
    items = await expense_service.get_user_expenses(db, user_id=user_id, skip=skip, limit=limit)
    response_data = [ExpenseResponse.model_validate(item).model_dump(mode="json") for item in items]
    return success_response(data=response_data, message="Expenses retrieved successfully")


@router.get("/{expense_id}", response_model=None)
async def get_expense(
    expense_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve a specific expense by ID."""
    item = await expense_service.get_expense(db, expense_id=expense_id, user_id=user_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense record not found")
    return success_response(data=ExpenseResponse.model_validate(item).model_dump(mode="json"), message="Expense retrieved successfully")


@router.post("", response_model=None, status_code=status.HTTP_201_CREATED)
async def create_expense(
    obj_in: ExpenseCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Create a new expense entry."""
    item = await expense_service.create_expense(db, user_id=user_id, obj_in=obj_in)
    return success_response(
        data=ExpenseResponse.model_validate(item).model_dump(mode="json"),
        message="Expense created successfully",
        status_code=status.HTTP_201_CREATED
    )


@router.put("/{expense_id}", response_model=None)
async def update_expense(
    expense_id: UUID,
    obj_in: ExpenseUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Update an existing expense record."""
    item = await expense_service.update_expense(db, expense_id=expense_id, user_id=user_id, obj_in=obj_in)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense record not found")
    return success_response(data=ExpenseResponse.model_validate(item).model_dump(mode="json"), message="Expense updated successfully")


@router.delete("/{expense_id}", response_model=None)
async def delete_expense(
    expense_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Delete an expense record."""
    item = await expense_service.delete_expense(db, expense_id=expense_id, user_id=user_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense record not found")
    return success_response(message="Expense deleted successfully")
