import { apiClient } from "./client";

export interface IncomeSource {
  id: string;
  source_name: string;
  category?: string;
  amount: number;
  monthly_amount: number;
  frequency: string;
  notes?: string;
  created_at?: string;
  [key: string]: any;
}

export async function getIncomeSources(): Promise<IncomeSource[]> {
  try {
    const res = await apiClient.get("/income");
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : [];
  } catch (e) {
    try {
      const res = await apiClient.get("/income-sources");
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn("Failed to get income sources:", err);
      return [];
    }
  }
}

export async function createIncomeSource(data: Partial<IncomeSource>): Promise<IncomeSource> {
  try {
    const res = await apiClient.post("/income", data);
    return res.data?.data || res.data;
  } catch (e) {
    const res = await apiClient.post("/income-sources", data);
    return res.data?.data || res.data;
  }
}

export async function updateIncomeSource(id: string, data: Partial<IncomeSource>): Promise<IncomeSource> {
  try {
    const res = await apiClient.put(`/income/${id}`, data);
    return res.data?.data || res.data;
  } catch (e) {
    const res = await apiClient.put(`/income-sources/${id}`, data);
    return res.data?.data || res.data;
  }
}

export async function deleteIncomeSource(id: string): Promise<void> {
  try {
    await apiClient.delete(`/income/${id}`);
  } catch (e) {
    await apiClient.delete(`/income-sources/${id}`);
  }
}
