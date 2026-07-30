from app.models.asset import Asset
from app.repositories.base import BaseRepository


class AssetRepository(BaseRepository[Asset]):
    def __init__(self):
        super().__init__(Asset)


asset_repository = AssetRepository()
