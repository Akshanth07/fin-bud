from app.schemas.common import BaseSchema, PaginatedResponse
from app.schemas.user import UserBase, UserCreate, UserUpdate, UserResponse
from app.schemas.investment import InvestmentBase, InvestmentCreate, InvestmentUpdate, InvestmentResponse
from app.schemas.loan import LoanBase, LoanCreate, LoanUpdate, LoanResponse
from app.schemas.insurance import InsurancePolicyBase, InsurancePolicyCreate, InsurancePolicyUpdate, InsurancePolicyResponse
from app.schemas.goal import GoalBase, GoalCreate, GoalUpdate, GoalResponse
from app.schemas.life_event import LifeEventSimulationBase, LifeEventSimulationCreate, LifeEventSimulationUpdate, LifeEventSimulationResponse
from app.schemas.scheme import (
    GovernmentSchemeBase, GovernmentSchemeCreate, GovernmentSchemeUpdate, GovernmentSchemeResponse,
    UserSchemeMatchBase, UserSchemeMatchCreate, UserSchemeMatchResponse
)
from app.schemas.news import (
    MarketNewsBase, MarketNewsCreate, MarketNewsResponse,
    MarketNewsItemSchema, MarketNewsListResponse
)
from app.schemas.insight import AIInsightBase, AIInsightCreate, AIInsightResponse
from app.schemas.notification import NotificationBase, NotificationCreate, NotificationUpdate, NotificationResponse
from app.schemas.income import IncomeSourceBase, IncomeSourceCreate, IncomeSourceUpdate, IncomeSourceResponse
from app.schemas.expense import ExpenseBase, ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.schemas.asset import AssetBase, AssetCreate, AssetUpdate, AssetResponse

__all__ = [
    "BaseSchema",
    "PaginatedResponse",
    "UserBase", "UserCreate", "UserUpdate", "UserResponse",
    "InvestmentBase", "InvestmentCreate", "InvestmentUpdate", "InvestmentResponse",
    "LoanBase", "LoanCreate", "LoanUpdate", "LoanResponse",
    "InsurancePolicyBase", "InsurancePolicyCreate", "InsurancePolicyUpdate", "InsurancePolicyResponse",
    "GoalBase", "GoalCreate", "GoalUpdate", "GoalResponse",
    "LifeEventSimulationBase", "LifeEventSimulationCreate", "LifeEventSimulationUpdate", "LifeEventSimulationResponse",
    "GovernmentSchemeBase", "GovernmentSchemeCreate", "GovernmentSchemeUpdate", "GovernmentSchemeResponse",
    "UserSchemeMatchBase", "UserSchemeMatchCreate", "UserSchemeMatchResponse",
    "MarketNewsBase", "MarketNewsCreate", "MarketNewsResponse",
    "MarketNewsItemSchema", "MarketNewsListResponse",
    "AIInsightBase", "AIInsightCreate", "AIInsightResponse",
    "NotificationBase", "NotificationCreate", "NotificationUpdate", "NotificationResponse",
    "IncomeSourceBase", "IncomeSourceCreate", "IncomeSourceUpdate", "IncomeSourceResponse",
    "ExpenseBase", "ExpenseCreate", "ExpenseUpdate", "ExpenseResponse",
    "AssetBase", "AssetCreate", "AssetUpdate", "AssetResponse",
]
