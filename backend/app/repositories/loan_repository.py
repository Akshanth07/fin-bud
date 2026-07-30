from app.models.loan import Loan
from app.repositories.base import BaseRepository


class LoanRepository(BaseRepository[Loan]):
    def __init__(self):
        super().__init__(Loan)


loan_repository = LoanRepository()
