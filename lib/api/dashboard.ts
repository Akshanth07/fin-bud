import { apiClient } from "./client";

export interface CalculatedDashboardSummary {
  net_worth: number;
  total_assets: number;
  total_liabilities: number;
  monthly_income: number;
  monthly_expenses: number;
  monthly_savings?: number;
  savings_rate: number;
  emergency_fund_months: number;
  financial_health_score: number;
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
