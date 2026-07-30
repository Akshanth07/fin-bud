import { apiClient } from "./client";

export interface AssetItem {
  id: string;
  user_id?: string;
  name?: string;
  asset_name: string;
  asset_type: string;
  category?: string;
  value?: number;
  valuation: number;
  current_value?: number;
  institution?: string;
  notes?: string;
  created_at?: string;
  [key: string]: any;
}

export async function getAssets(): Promise<AssetItem[]> {
  try {
    const res = await apiClient.get("/assets");
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("Failed to fetch assets:", err);
    return [];
  }
}

export async function createAsset(data: Partial<AssetItem>): Promise<AssetItem> {
  const res = await apiClient.post("/assets", data);
  return res.data?.data || res.data;
}

export async function updateAsset(id: string, data: Partial<AssetItem>): Promise<AssetItem> {
  const res = await apiClient.put(`/assets/${id}`, data);
  return res.data?.data || res.data;
}

export async function deleteAsset(id: string): Promise<boolean> {
  await apiClient.delete(`/assets/${id}`);
  return true;
}
