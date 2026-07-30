from app.models.insight import AIInsight
from app.repositories.base import BaseRepository


class AIInsightRepository(BaseRepository[AIInsight]):
    def __init__(self):
        super().__init__(AIInsight)


insight_repository = AIInsightRepository()
