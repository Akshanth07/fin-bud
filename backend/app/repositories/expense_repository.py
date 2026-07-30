from app.models.expense import Expense
from app.repositories.base import BaseRepository


class ExpenseRepository(BaseRepository[Expense]):
    def __init__(self):
        super().__init__(Expense)


expense_repository = ExpenseRepository()
