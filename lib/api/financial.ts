import { apiClient } from "./client";

export interface UserProfileData {
  id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  currency?: string;
  risk_profile?: string;
  investment_goal?: string;
  age?: number;
  city?: string;
  state?: string;
  occupation?: string;
  monthly_income?: number;
  monthly_expenses?: number;
  total_assets?: number;
  total_liabilities?: number;
  emergency_fund?: number;
  savings?: number;
  risk_tolerance?: string;
  marital_status?: string;
  dependents?: number;
}

export async function getFinancialProfile(): Promise<UserProfileData | null> {
  try {
    const res = await apiClient.get("/users/me");
    return res.data?.data || res.data || null;
  } catch (e) {
    console.warn("Failed to get financial profile:", e);
    return null;
  }
}

export async function updateFinancialProfile(payload: Partial<UserProfileData>): Promise<UserProfileData> {
  const res = await apiClient.put("/users/me", payload);
  return res.data?.data || res.data;
}
