export interface DashboardSummary {
  totalBalance: number;
  netWorth: number;
  savingsRate: number;
  financialHealthScore: number;
  monthlySpending: number;
  cashBack?: number;
}

export interface CreditCardInfo {
  type: string;
  last4: string;
  balance: number;
  network: "mastercard" | "visa";
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthLabel: string;
}

export interface Bill {
  id: string;
  name: string;
  vendor: string;
  date: string;
  month: string;
  day: string;
  logoColor: string;
}

export interface Transaction {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  type: "revenue" | "expense";
  icon: string;
}

export interface WeeklyStat {
  day: string;
  previous: number;
  current: number;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  amount: number;
  changePercent: number;
  trend: "up" | "down";
}

export interface FinancialProfile {
  monthlyIncome: number;
  monthlyExpenses: number;
  bankBalance: number;
  investments: number;
  loans: number;
  insuranceCoverage: number;
  netWorth: number;
  debtToIncomeRatio: number;
  emergencyFundMonths: number;
}

export interface LifeEvent {
  id: string;
  label: string;
  description: string;
}

export interface InvestmentRecommendation {
  id: string;
  title: string;
  description: string;
  riskLevel: "low" | "medium" | "high";
}

export interface GovernmentScheme {
  id: string;
  name: string;
  category: string;
  description: string;
  eligible: boolean;
}

export interface FinancialGoalPlan {
  id: string;
  goal: string;
  targetAmount: number;
  timelineYears: number;
  monthlyRequired: number;
  progressPercent: number;
}

export interface InsurancePolicy {
  id: string;
  name: string;
  provider: string;
  coverage: number;
  premium: number;
  status: "active" | "expiring" | "lapsed";
}

export interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  value: number;
  dayChangePercent: number;
  allocationPercent: number;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  publishedAt: string;
  relevance: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}
