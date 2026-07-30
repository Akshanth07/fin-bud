import { apiClient } from "./client";

export interface InvestmentItem {
  id: string;
  asset_name: string;
  asset_type: string;
  category?: string;
  quantity: number;
  purchase_price?: number;
  current_price: number;
  current_value?: number;
  amount_invested?: number;
  total_value?: number;
  notes?: string;
  created_at?: string;
  [key: string]: any;
}

export async function getInvestments(): Promise<InvestmentItem[]> {
  try {
    const res = await apiClient.get("/investments");
    return res.data?.data || res.data || [];
  } catch (e) {
    console.warn("Failed to get investments:", e);
    return [];
  }
}

export async function createInvestment(data: Partial<InvestmentItem>): Promise<InvestmentItem> {
  const res = await apiClient.post("/investments", data);
  return res.data?.data || res.data;
}

export async function updateInvestment(id: string, data: Partial<InvestmentItem>): Promise<InvestmentItem> {
  const res = await apiClient.put(`/investments/${id}`, data);
  return res.data?.data || res.data;
}

export async function deleteInvestment(id: string): Promise<void> {
  await apiClient.delete(`/investments/${id}`);
}
