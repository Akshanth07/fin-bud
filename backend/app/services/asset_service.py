from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.asset import Asset
from app.schemas.asset import AssetCreate, AssetUpdate
from app.repositories.asset_repository import asset_repository


class AssetService:
    async def get_user_assets(
        self, db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Asset]:
        return await asset_repository.get_multi_by_user(db, user_id=user_id, skip=skip, limit=limit)

    async def get_asset(self, db: AsyncSession, asset_id: UUID, user_id: UUID) -> Optional[Asset]:
        asset = await asset_repository.get_by_id(db, asset_id)
        if asset and asset.user_id == user_id:
            return asset
        return None

    async def create_asset(self, db: AsyncSession, user_id: UUID, obj_in: AssetCreate) -> Asset:
        data = obj_in.model_dump()
        data["user_id"] = user_id
        return await asset_repository.create(db, data)

    async def update_asset(
        self, db: AsyncSession, asset_id: UUID, user_id: UUID, obj_in: AssetUpdate
    ) -> Optional[Asset]:
        asset = await self.get_asset(db, asset_id, user_id)
        if not asset:
            return None
        return await asset_repository.update(
            db, db_obj=asset, obj_in=obj_in.model_dump(exclude_unset=True)
        )

    async def delete_asset(self, db: AsyncSession, asset_id: UUID, user_id: UUID) -> Optional[Asset]:
        asset = await self.get_asset(db, asset_id, user_id)
        if not asset:
            return None
        return await asset_repository.delete(db, id=asset_id)


asset_service = AssetService()
