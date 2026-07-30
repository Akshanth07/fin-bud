from app.models.investment import Investment
from app.repositories.base import BaseRepository


class InvestmentRepository(BaseRepository[Investment]):
    def __init__(self):
        super().__init__(Investment)


investment_repository = InvestmentRepository()
