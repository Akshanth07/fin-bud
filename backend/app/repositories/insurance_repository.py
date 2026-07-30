from app.models.insurance import InsurancePolicy
from app.repositories.base import BaseRepository


class InsuranceRepository(BaseRepository[InsurancePolicy]):
    def __init__(self):
        super().__init__(InsurancePolicy)


insurance_repository = InsuranceRepository()
