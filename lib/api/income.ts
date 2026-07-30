import { apiClient } from "./client";

export interface IncomeSource {
  id?: string;
  source_name: string;
  category: string;
  amount: number;
  monthly_amount?: number;
  frequency?: string;
  notes?: string;
  created_at?: string;
}

export async function getIncomeSources(): Promise<IncomeSource[]> {
  try {
    const res = await apiClient.get("/income-sources");
    return res.data?.data || res.data || [];
  } catch (e) {
    console.warn("Failed to get income sources:", e);
    return [];
  }
}

export async function createIncomeSource(data: Partial<IncomeSource>): Promise<IncomeSource> {
  const res = await apiClient.post("/income-sources", data);
  return res.data?.data || res.data;
}

export async function updateIncomeSource(id: string, data: Partial<IncomeSource>): Promise<IncomeSource> {
  const res = await apiClient.put(`/income-sources/${id}`, data);
  return res.data?.data || res.data;
}

export async function deleteIncomeSource(id: string): Promise<void> {
  await apiClient.delete(`/income-sources/${id}`);
}
