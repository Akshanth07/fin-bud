from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user_id, get_db
from app.schemas.loan import LoanCreate, LoanResponse, LoanUpdate
from app.services.loan_service import loan_service
from app.utils.response import success_response

router = APIRouter(prefix="/loans", tags=["Loans"])


@router.get("", response_model=None)
async def list_loans(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all loans for current user."""
    items = await loan_service.get_user_loans(db, user_id=user_id, skip=skip, limit=limit)
    response_data = [LoanResponse.model_validate(item).model_dump(mode="json") for item in items]
    return success_response(data=response_data, message="Loans retrieved successfully")


@router.get("/{loan_id}", response_model=None)
async def get_loan(
    loan_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve a specific loan by ID."""
    item = await loan_service.get_loan(db, loan_id=loan_id, user_id=user_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan record not found")
    return success_response(data=LoanResponse.model_validate(item).model_dump(mode="json"), message="Loan retrieved successfully")


@router.post("", response_model=None, status_code=status.HTTP_201_CREATED)
async def create_loan(
    obj_in: LoanCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Create a new loan record."""
    item = await loan_service.create_loan(db, user_id=user_id, obj_in=obj_in)
    return success_response(
        data=LoanResponse.model_validate(item).model_dump(mode="json"),
        message="Loan created successfully",
        status_code=status.HTTP_201_CREATED
    )


@router.put("/{loan_id}", response_model=None)
async def update_loan(
    loan_id: UUID,
    obj_in: LoanUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Update an existing loan record."""
    item = await loan_service.update_loan(db, loan_id=loan_id, user_id=user_id, obj_in=obj_in)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan record not found")
    return success_response(data=LoanResponse.model_validate(item).model_dump(mode="json"), message="Loan updated successfully")


@router.delete("/{loan_id}", response_model=None)
async def delete_loan(
    loan_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Delete a loan record."""
    item = await loan_service.delete_loan(db, loan_id=loan_id, user_id=user_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan record not found")
    return success_response(message="Loan deleted successfully")
