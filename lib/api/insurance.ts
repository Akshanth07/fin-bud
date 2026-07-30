import { apiClient } from "./client";
import { mockInsurancePolicies } from "@/lib/mock-data";

export interface InsurancePolicyData {
  id: string;
  policy_name: string;
  policy_number?: string;
  insurance_type?: string;
  provider_name?: string;
  coverage_amount: number;
  premium_amount: number;
  premium_frequency?: string;
  policy_start_date?: string | null;
  policy_end_date?: string | null;
  status?: string;
  created_at?: string;
  company?: string;
  provider?: string;
  plan_name?: string;
  policy_type?: string;
  premium?: number;
  analysis?: any;
  ai_explanation?: {
    strengths: string[];
    weaknesses: string[];
    risks: string[];
    gaps: string[];
    recommendations: string[];
    summary?: string;
    [key: string]: any;
  };
  ocr_confidence?: number;
  policy_holder?: string;
  nominee?: string;
  claim_contact?: string;
  start_date?: string | null;
  end_date?: string | null;
  renewal_date?: string | null;
  maturity_date?: string | null;
  [key: string]: any;
}

export interface OCRUploadResponseData {
  extracted_data: Partial<InsurancePolicyData>;
  extracted_info?: Partial<InsurancePolicyData>;
  analysis?: any;
  ai_explanation?: {
    strengths: string[];
    weaknesses: string[];
    risks: string[];
    gaps: string[];
    recommendations: string[];
    summary?: string;
    [key: string]: any;
  };
  validation_warnings?: string[];
  raw_text?: string;
  confidence?: number;
  [key: string]: any;
}

export interface InsurancePortfolioAnalysis {
  coverage_gap_warnings: string[];
  recommendations: string[];
  [key: string]: any;
}

export async function getInsurancePolicies(): Promise<InsurancePolicyData[]> {
  try {
    const res = await apiClient.get("/insurance");
    const data = res.data?.data?.policies || res.data?.data || res.data;
    if (Array.isArray(data) && data.length > 0) return data;
    return mockInsurancePolicies as InsurancePolicyData[];
  } catch (e) {
    console.warn("Failed to get insurance policies, using mock data:", e);
    return mockInsurancePolicies as InsurancePolicyData[];
  }
}

export async function getPolicies(): Promise<{ policies: InsurancePolicyData[]; portfolio_analysis?: InsurancePortfolioAnalysis }> {
  try {
    const res = await apiClient.get("/insurance");
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) {
      return { policies: data };
    }
    if (data?.policies) {
      return data;
    }
    return { policies: mockInsurancePolicies as InsurancePolicyData[] };
  } catch (e) {
    console.warn("Failed to get policies:", e);
    return { policies: mockInsurancePolicies as InsurancePolicyData[] };
  }
}

export async function getPolicy(id: string): Promise<InsurancePolicyData> {
  const res = await apiClient.get(`/insurance/${id}`);
  return res.data?.data || res.data;
}

export async function uploadPolicyDocument(file: File): Promise<OCRUploadResponseData> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiClient.post("/insurance/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.data || res.data;
}

export async function createPolicy(payload: Partial<InsurancePolicyData>): Promise<InsurancePolicyData> {
  const res = await apiClient.post("/insurance", payload);
  return res.data?.data || res.data;
}

export async function updatePolicy(id: string, payload: Partial<InsurancePolicyData>): Promise<InsurancePolicyData> {
  const res = await apiClient.put(`/insurance/${id}`, payload);
  return res.data?.data || res.data;
}

export async function deletePolicy(id: string): Promise<void> {
  await apiClient.delete(`/insurance/${id}`);
}
