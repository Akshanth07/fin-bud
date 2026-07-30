from app.models.life_event import LifeEventSimulation
from app.repositories.base import BaseRepository


class LifeEventRepository(BaseRepository[LifeEventSimulation]):
    def __init__(self):
        super().__init__(LifeEventSimulation)


life_event_repository = LifeEventRepository()
