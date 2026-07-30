from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user_id, get_db
from app.schemas.notification import NotificationCreate, NotificationResponse
from app.services.notification_service import notification_service
from app.utils.response import success_response

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=None)
async def list_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve notifications for current user."""
    items = await notification_service.get_user_notifications(db, user_id=user_id, skip=skip, limit=limit)
    response_data = [NotificationResponse.model_validate(item).model_dump(mode="json") for item in items]
    return success_response(data=response_data, message="Notifications retrieved successfully")


@router.post("", response_model=None, status_code=status.HTTP_201_CREATED)
async def create_notification(
    obj_in: NotificationCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Create a new notification entry for current user."""
    item = await notification_service.create_notification(db, user_id=user_id, obj_in=obj_in)
    return success_response(
        data=NotificationResponse.model_validate(item).model_dump(mode="json"),
        message="Notification created successfully",
        status_code=status.HTTP_201_CREATED
    )


@router.patch("/{notification_id}/read", response_model=None)
async def mark_notification_as_read(
    notification_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Mark a notification as read."""
    item = await notification_service.mark_as_read(db, notification_id=notification_id, user_id=user_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return success_response(data=NotificationResponse.model_validate(item).model_dump(mode="json"), message="Notification marked as read")


@router.patch("/read-all", response_model=None)
async def mark_all_notifications_as_read(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Mark all notifications as read for current user."""
    count = await notification_service.mark_all_as_read(db, user_id=user_id)
    return success_response(data={"updated_count": count}, message=f"Marked {count} notifications as read")
