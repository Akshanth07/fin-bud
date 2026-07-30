from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user_id, get_db
from app.schemas.scheme import (
    GovernmentSchemeResponse, RecommendedSchemeResponse,
    SaveSchemeCreate, SavedSchemeResponse, SavedSchemeStatusUpdate
)
from app.services.scheme_service import scheme_service
from app.utils.response import success_response

router = APIRouter(prefix="/schemes", tags=["Government Schemes"])


@router.get("", response_model=None)
async def list_schemes(
    category: Optional[str] = Query(None, description="Category filter"),
    state: Optional[str] = Query(None, description="State filter"),
    search: Optional[str] = Query(None, description="Search term"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve list of active government schemes with optional filters."""
    items = await scheme_service.get_all_schemes(
        db, category=category, state=state, search=search, skip=skip, limit=limit
    )
    response_data = [GovernmentSchemeResponse.model_validate(item).model_dump(mode="json") for item in items]
    return success_response(data=response_data, message="Government schemes retrieved successfully")


@router.get("/recommended", response_model=None)
async def get_recommended_schemes(
    category: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    eligible_only: bool = Query(False),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve personalized government scheme recommendations based on user's Financial Profile,
    goals, and insurance status. Computed dynamically at request time (No LLM).
    """
    items = await scheme_service.get_personalized_recommendations(
        db, user_id=user_id, category=category, state=state, eligible_only=eligible_only, search=search, limit=limit
    )
    return success_response(data=items, message="Personalized scheme recommendations generated successfully")


@router.get("/saved", response_model=None)
async def get_saved_schemes(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all saved schemes and application tracker statuses for current user."""
    items = await scheme_service.get_user_saved_schemes(db, user_id=user_id)
    response_data = [SavedSchemeResponse.model_validate(item).model_dump(mode="json") for item in items]
    return success_response(data=response_data, message="Saved schemes retrieved successfully")


@router.get("/{scheme_id}", response_model=None)
async def get_scheme(
    scheme_id: UUID,
    user_id: Optional[UUID] = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve full details of a specific government scheme."""
    item = await scheme_service.get_scheme_by_id(db, scheme_id=scheme_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Government scheme not found")
    return success_response(data=GovernmentSchemeResponse.model_validate(item).model_dump(mode="json"), message="Government scheme retrieved successfully")


@router.post("/save", response_model=None, status_code=status.HTTP_201_CREATED)
async def save_scheme(
    body: SaveSchemeCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Save or bookmark a government scheme."""
    item = await scheme_service.save_scheme(db, user_id=user_id, scheme_id=body.scheme_id, status=body.application_status)
    return success_response(
        data=SavedSchemeResponse.model_validate(item).model_dump(mode="json"),
        message="Scheme saved successfully",
        status_code=status.HTTP_201_CREATED
    )


@router.delete("/save/{scheme_id}", response_model=None)
async def unsave_scheme(
    scheme_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Remove a saved scheme."""
    success = await scheme_service.unsave_scheme(db, user_id=user_id, scheme_id=scheme_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved scheme not found")
    return success_response(message="Scheme removed from saved list successfully")


@router.patch("/status", response_model=None)
async def update_application_status(
    body: SavedSchemeStatusUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Update application tracking status (Interested, Applied, Approved, Rejected, Completed)."""
    item = await scheme_service.update_saved_status(db, user_id=user_id, scheme_id=body.scheme_id, status=body.application_status)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved scheme record not found")
    return success_response(
        data=SavedSchemeResponse.model_validate(item).model_dump(mode="json"),
        message="Application status updated successfully"
    )
