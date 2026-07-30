from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.life_event import LifeEventSimulation
from app.schemas.life_event import LifeEventSimulationCreate, LifeEventSimulationUpdate
from app.repositories.life_event_repository import life_event_repository


class LifeEventService:
    async def get_user_simulations(
        self, db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[LifeEventSimulation]:
        return await life_event_repository.get_multi_by_user(db, user_id=user_id, skip=skip, limit=limit)

    async def get_simulation(self, db: AsyncSession, simulation_id: UUID, user_id: UUID) -> Optional[LifeEventSimulation]:
        sim = await life_event_repository.get_by_id(db, simulation_id)
        if sim and sim.user_id == user_id:
            return sim
        return None

    async def create_simulation(self, db: AsyncSession, user_id: UUID, obj_in: LifeEventSimulationCreate) -> LifeEventSimulation:
        data = obj_in.model_dump()
        data["user_id"] = user_id
        return await life_event_repository.create(db, data)

    async def delete_simulation(self, db: AsyncSession, simulation_id: UUID, user_id: UUID) -> Optional[LifeEventSimulation]:
        sim = await self.get_simulation(db, simulation_id, user_id)
        if not sim:
            return None
        return await life_event_repository.delete(db, id=simulation_id)


life_event_service = LifeEventService()
