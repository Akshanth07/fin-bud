import { apiClient } from "./client";

export interface LoanItem {
  id: string;
  loan_name?: string;
  loan_type: string;
  lender_name?: string;
  lender: string;
  principal_amount: number;
  remaining_amount?: number;
  outstanding_amount: number;
  interest_rate?: number;
  monthly_emi: number;
  emi: number;
  tenure_months?: number;
  start_date?: string;
  created_at?: string;
  [key: string]: any;
}

export async function getLoans(): Promise<LoanItem[]> {
  try {
    const res = await apiClient.get("/loans");
    return res.data?.data || res.data || [];
  } catch (e) {
    console.warn("Failed to get loans:", e);
    return [];
  }
}

export async function createLoan(data: Partial<LoanItem>): Promise<LoanItem> {
  const res = await apiClient.post("/loans", data);
  return res.data?.data || res.data;
}

export async function updateLoan(id: string, data: Partial<LoanItem>): Promise<LoanItem> {
  const res = await apiClient.put(`/loans/${id}`, data);
  return res.data?.data || res.data;
}

export async function deleteLoan(id: string): Promise<void> {
  await apiClient.delete(`/loans/${id}`);
}
