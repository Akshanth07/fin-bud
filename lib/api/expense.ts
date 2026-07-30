import { apiClient } from "./client";

export interface ExpenseItem {
  id?: string;
  category: string;
  title: string;
  amount: number;
  date?: string;
  frequency?: string;
  is_recurring?: boolean;
  notes?: string;
  created_at?: string;
}

export async function getExpenses(): Promise<ExpenseItem[]> {
  try {
    const res = await apiClient.get("/expenses");
    return res.data?.data || res.data || [];
  } catch (e) {
    console.warn("Failed to get expenses:", e);
    return [];
  }
}

export async function createExpense(data: Partial<ExpenseItem>): Promise<ExpenseItem> {
  const res = await apiClient.post("/expenses", data);
  return res.data?.data || res.data;
}

export async function updateExpense(id: string, data: Partial<ExpenseItem>): Promise<ExpenseItem> {
  const res = await apiClient.put(`/expenses/${id}`, data);
  return res.data?.data || res.data;
}

export async function deleteExpense(id: string): Promise<void> {
  await apiClient.delete(`/expenses/${id}`);
}
