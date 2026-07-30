from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user_id, get_db
from app.schemas.life_event import LifeEventSimulationCreate, LifeEventSimulationResponse
from app.services.life_event_service import life_event_service
from app.utils.response import success_response

router = APIRouter(prefix="/life-events", tags=["Life Events"])


@router.get("", response_model=None)
async def list_simulations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all life event simulations for current user."""
    items = await life_event_service.get_user_simulations(db, user_id=user_id, skip=skip, limit=limit)
    response_data = [LifeEventSimulationResponse.model_validate(item).model_dump(mode="json") for item in items]
    return success_response(data=response_data, message="Life event simulations retrieved successfully")


@router.get("/{simulation_id}", response_model=None)
async def get_simulation(
    simulation_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve a specific life event simulation by ID."""
    item = await life_event_service.get_simulation(db, simulation_id=simulation_id, user_id=user_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation record not found")
    return success_response(data=LifeEventSimulationResponse.model_validate(item).model_dump(mode="json"), message="Simulation retrieved successfully")


@router.post("", response_model=None, status_code=status.HTTP_201_CREATED)
async def create_simulation(
    obj_in: LifeEventSimulationCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Create a new life event simulation record."""
    item = await life_event_service.create_simulation(db, user_id=user_id, obj_in=obj_in)
    return success_response(
        data=LifeEventSimulationResponse.model_validate(item).model_dump(mode="json"),
        message="Simulation record created successfully",
        status_code=status.HTTP_201_CREATED
    )


@router.delete("/{simulation_id}", response_model=None)
async def delete_simulation(
    simulation_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Delete a life event simulation record."""
    item = await life_event_service.delete_simulation(db, simulation_id=simulation_id, user_id=user_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation record not found")
    return success_response(message="Simulation record deleted successfully")
