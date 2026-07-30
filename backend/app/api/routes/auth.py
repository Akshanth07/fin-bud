from fastapi import APIRouter, Depends
from uuid import UUID
from app.api.dependencies import get_current_user, get_current_user_id
from app.models.user import User
from app.schemas.user import UserResponse
from app.utils.response import success_response

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.get("/me")
async def get_auth_me(
    user_id: UUID = Depends(get_current_user_id),
    current_user: User = Depends(get_current_user)
):
    """
    Verify Supabase JWT access token and return current authenticated user profile.
    """
    return success_response(
        data=UserResponse.model_validate(current_user).model_dump(mode="json"),
        message="Authenticated user token validated successfully"
    )
