import { apiClient } from "./client";

export interface CalculatedDashboardSummary {
  user_id?: string;
  financial_health_score: number;
  net_worth: number;
  monthly_income: number;
  monthly_expenses: number;
  monthly_savings: number;
  savings_rate: number;
  debt_to_income_ratio: number;
  emergency_fund_coverage: number;
  emergency_fund_months?: number;
  total_assets: number;
  total_investments: number;
  total_liabilities: number;
  summaries: {
    assets_count: number;
    assets_total_valuation: number;
    investments_count: number;
    investments_total_value: number;
    loans_count: number;
    loans_total_outstanding: number;
    insurance_count: number;
    insurance_total_coverage: number;
    goals_count: number;
    income_sources_count: number;
    expenses_count: number;
  };
  [key: string]: any;
}

export async function getDashboardSummary(): Promise<CalculatedDashboardSummary | null> {
  try {
    const res = await apiClient.get("/dashboard/summary");
    return res.data?.data || res.data || null;
  } catch (e) {
    console.warn("Failed to get dashboard summary:", e);
    return null;
  }
}

export async function getDashboardChart(chartType: string): Promise<any> {
  try {
    const res = await apiClient.get(`/dashboard/charts/${chartType}`);
    return res.data?.data || res.data || [];
  } catch (e) {
    console.warn(`Failed to get dashboard chart ${chartType}:`, e);
    return [];
  }
}
