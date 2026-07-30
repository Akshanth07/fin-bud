from app.services.user_service import user_service, UserService
from app.services.investment_service import investment_service, InvestmentService
from app.services.loan_service import loan_service, LoanService
from app.services.insurance_service import insurance_service, InsuranceService
from app.services.goal_service import goal_service, GoalService
from app.services.life_event_service import life_event_service, LifeEventService
from app.services.scheme_service import scheme_service, GovernmentSchemeService
from app.services.news_service import news_service, MarketNewsService
from app.services.insight_service import insight_service, AIInsightService
from app.services.notification_service import notification_service, NotificationService
from app.services.dashboard_service import dashboard_service, DashboardService
from app.services.income_service import income_service, IncomeService
from app.services.expense_service import expense_service, ExpenseService
from app.services.asset_service import asset_service, AssetService

__all__ = [
    "user_service", "UserService",
    "investment_service", "InvestmentService",
    "loan_service", "LoanService",
    "insurance_service", "InsuranceService",
    "goal_service", "GoalService",
    "life_event_service", "LifeEventService",
    "scheme_service", "GovernmentSchemeService",
    "news_service", "MarketNewsService",
    "insight_service", "AIInsightService",
    "notification_service", "NotificationService",
    "dashboard_service", "DashboardService",
    "income_service", "IncomeService",
    "expense_service", "ExpenseService",
    "asset_service", "AssetService",
]
