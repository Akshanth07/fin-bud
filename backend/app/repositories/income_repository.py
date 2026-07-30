from app.models.income import IncomeSource
from app.repositories.base import BaseRepository


class IncomeRepository(BaseRepository[IncomeSource]):
    def __init__(self):
        super().__init__(IncomeSource)


income_repository = IncomeRepository()
