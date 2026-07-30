import { apiClient } from "./client";

export interface GovernmentSchemeData {
  id: string;
  scheme_code?: string;
  name: string;
  scheme_name?: string;
  category: string;
  status?: string;
  version?: string;
  short_description?: string;
  description?: string;
  full_description?: string;
  eligibility_criteria?: Record<string, any>;
  eligibility_summary?: string;
  benefits?: any;
  state?: string;
  ministry?: string;
  official_website_url?: string;
  official_url?: string;
  is_saved?: boolean;
}

export interface RecommendedSchemeData extends GovernmentSchemeData {
  match_score?: number;
  match_reasons?: string[];
  reasons?: string[];
  is_eligible?: boolean;
  eligible?: boolean;
  eligibility_percentage?: number;
  priority_score?: number;
  source?: string;
  goal_matched?: any;
  estimated_financial_benefit?: number;
  saved_status?: string;
}

export interface SavedSchemeData {
  id: string;
  scheme_id: string;
  scheme: GovernmentSchemeData;
  status: string;
  application_status?: string;
  saved_at: string;
}

export async function getSchemes(params?: any): Promise<GovernmentSchemeData[]> {
  try {
    const res = await apiClient.get("/schemes", { params });
    return res.data?.data || res.data || [];
  } catch (e) {
    console.warn("Failed to get schemes:", e);
    return [];
  }
}

export async function getRecommendedSchemes(params?: any): Promise<RecommendedSchemeData[]> {
  try {
    const res = await apiClient.get("/schemes/recommended", { params });
    return res.data?.data || res.data || [];
  } catch (e) {
    console.warn("Failed to get recommended schemes:", e);
    return [];
  }
}

export async function getSavedSchemes(): Promise<SavedSchemeData[]> {
  try {
    const res = await apiClient.get("/schemes/saved");
    return res.data?.data || res.data || [];
  } catch (e) {
    console.warn("Failed to get saved schemes:", e);
    return [];
  }
}

export async function getScheme(id: string): Promise<GovernmentSchemeData> {
  const res = await apiClient.get(`/schemes/${id}`);
  return res.data?.data || res.data;
}

export async function saveScheme(schemeId: string, status: string = "Interested"): Promise<SavedSchemeData> {
  const res = await apiClient.post("/schemes/save", { scheme_id: schemeId, application_status: status });
  return res.data?.data || res.data;
}

export async function unsaveScheme(schemeId: string): Promise<void> {
  await apiClient.delete(`/schemes/save/${schemeId}`);
}

export async function updateSavedStatus(schemeId: string, status: string): Promise<SavedSchemeData> {
  const res = await apiClient.patch("/schemes/status", { scheme_id: schemeId, application_status: status });
  return res.data?.data || res.data;
}
