from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification
from app.repositories.base import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    def __init__(self):
        super().__init__(Notification)

    async def mark_as_read(self, db: AsyncSession, *, notification_id: UUID, user_id: UUID) -> Optional[Notification]:
        """Mark a notification as read for a given user."""
        notification = await self.get_by_id(db, notification_id)
        if notification and notification.user_id == user_id:
            notification.is_read = True
            db.add(notification)
            await db.flush()
            await db.refresh(notification)
            return notification
        return None

    async def mark_all_as_read(self, db: AsyncSession, user_id: UUID) -> int:
        """Mark all notifications as read for a given user."""
        stmt = (
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read == False)
            .values(is_read=True)
        )
        result = await db.execute(stmt)
        return result.rowcount


notification_repository = NotificationRepository()
