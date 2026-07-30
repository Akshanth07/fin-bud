from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user_id, get_db
from app.schemas.goal import GoalCreate, GoalResponse, GoalUpdate, GoalContribution
from app.services.goal_service import goal_service
from app.utils.response import success_response

router = APIRouter(prefix="/goals", tags=["Goals"])


@router.get("", response_model=None)
async def list_goals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all financial goals for current user."""
    items = await goal_service.get_user_goals(db, user_id=user_id, skip=skip, limit=limit)
    response_data = [GoalResponse.model_validate(item).model_dump(mode="json") for item in items]
    return success_response(data=response_data, message="Goals retrieved successfully")


@router.get("/{goal_id}", response_model=None)
async def get_goal(
    goal_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve a specific financial goal by ID."""
    item = await goal_service.get_goal(db, goal_id=goal_id, user_id=user_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Financial goal not found")
    return success_response(data=GoalResponse.model_validate(item).model_dump(mode="json"), message="Goal retrieved successfully")


@router.post("", response_model=None, status_code=status.HTTP_201_CREATED)
async def create_goal(
    obj_in: GoalCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Create a new financial goal."""
    item = await goal_service.create_goal(db, user_id=user_id, obj_in=obj_in)
    return success_response(
        data=GoalResponse.model_validate(item).model_dump(mode="json"),
        message="Goal created successfully",
        status_code=status.HTTP_201_CREATED
    )


@router.put("/{goal_id}", response_model=None)
async def update_goal(
    goal_id: UUID,
    obj_in: GoalUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Update an existing financial goal."""
    item = await goal_service.update_goal(db, goal_id=goal_id, user_id=user_id, obj_in=obj_in)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Financial goal not found")
    return success_response(data=GoalResponse.model_validate(item).model_dump(mode="json"), message="Goal updated successfully")


@router.delete("/{goal_id}", response_model=None)
async def delete_goal(
    goal_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Delete a financial goal."""
    item = await goal_service.delete_goal(db, goal_id=goal_id, user_id=user_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Financial goal not found")
    return success_response(message="Goal deleted successfully")


@router.post("/{goal_id}/contribute", response_model=None)
async def add_contribution(
    goal_id: UUID,
    body: GoalContribution,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Add a contribution amount to a goal's current savings."""
    item = await goal_service.add_contribution(db, goal_id=goal_id, user_id=user_id, amount=body.amount)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Financial goal not found")
    return success_response(
        data=GoalResponse.model_validate(item).model_dump(mode="json"),
        message="Contribution added successfully"
    )


@router.get("/{goal_id}/prediction", response_model=None)
async def get_goal_prediction(
    goal_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get AI-powered goal prediction and recommendation."""
    prediction = await goal_service.get_goal_prediction(db, goal_id=goal_id, user_id=user_id)
    if not prediction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Financial goal not found")
    return success_response(data=prediction, message="Goal prediction generated successfully")
