from app.repositories.base import BaseRepository
from app.repositories.user_repository import user_repository, UserRepository
from app.repositories.investment_repository import investment_repository, InvestmentRepository
from app.repositories.loan_repository import loan_repository, LoanRepository
from app.repositories.insurance_repository import insurance_repository, InsuranceRepository
from app.repositories.goal_repository import goal_repository, GoalRepository
from app.repositories.life_event_repository import life_event_repository, LifeEventRepository
from app.repositories.scheme_repository import (
    scheme_repository, GovernmentSchemeRepository,
    user_scheme_match_repository, UserSchemeMatchRepository
)
from app.repositories.news_repository import news_repository, MarketNewsRepository
from app.repositories.insight_repository import insight_repository, AIInsightRepository
from app.repositories.notification_repository import notification_repository, NotificationRepository
from app.repositories.income_repository import income_repository, IncomeRepository
from app.repositories.expense_repository import expense_repository, ExpenseRepository
from app.repositories.asset_repository import asset_repository, AssetRepository

__all__ = [
    "BaseRepository",
    "user_repository", "UserRepository",
    "investment_repository", "InvestmentRepository",
    "loan_repository", "LoanRepository",
    "insurance_repository", "InsuranceRepository",
    "goal_repository", "GoalRepository",
    "life_event_repository", "LifeEventRepository",
    "scheme_repository", "GovernmentSchemeRepository",
    "user_scheme_match_repository", "UserSchemeMatchRepository",
    "news_repository", "MarketNewsRepository",
    "insight_repository", "AIInsightRepository",
    "notification_repository", "NotificationRepository",
    "income_repository", "IncomeRepository",
    "expense_repository", "ExpenseRepository",
    "asset_repository", "AssetRepository",
]
