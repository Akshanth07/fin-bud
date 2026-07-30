from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_current_user, get_current_user_id, get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import user_service
from app.utils.response import success_response

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me")
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Fetch current user's profile information."""
    return success_response(
        data=UserResponse.model_validate(current_user).model_dump(mode="json"),
        message="User profile retrieved successfully"
    )


@router.put("/me")
async def update_my_profile(
    user_in: UserUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Update current user's personal & financial details."""
    updated_user = await user_service.update_user(db, user_id=user_id, user_in=user_in)
    if not updated_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")
    return success_response(
        data=UserResponse.model_validate(updated_user).model_dump(mode="json"),
        message="User profile updated successfully"
    )
