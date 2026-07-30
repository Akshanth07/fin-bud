from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate
from app.repositories.notification_repository import notification_repository


class NotificationService:
    async def get_user_notifications(
        self, db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Notification]:
        return await notification_repository.get_multi_by_user(db, user_id=user_id, skip=skip, limit=limit)

    async def create_notification(self, db: AsyncSession, user_id: UUID, obj_in: NotificationCreate) -> Notification:
        data = obj_in.model_dump()
        data["user_id"] = user_id
        return await notification_repository.create(db, data)

    async def mark_as_read(self, db: AsyncSession, notification_id: UUID, user_id: UUID) -> Optional[Notification]:
        return await notification_repository.mark_as_read(db, notification_id=notification_id, user_id=user_id)

    async def mark_all_as_read(self, db: AsyncSession, user_id: UUID) -> int:
        return await notification_repository.mark_all_as_read(db, user_id)


notification_service = NotificationService()
