import { apiClient } from "./client";

export interface AssetItem {
  id?: string;
  asset_name: string;
  asset_type: string;
  category?: string;
  current_value: number;
  valuation?: number;
  purchase_price?: number;
  purchase_date?: string;
  notes?: string;
  created_at?: string;
}

export async function getAssets(): Promise<AssetItem[]> {
  try {
    const res = await apiClient.get("/assets");
    return res.data?.data || res.data || [];
  } catch (e) {
    console.warn("Failed to get assets:", e);
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

export async function deleteAsset(id: string): Promise<void> {
  await apiClient.delete(`/assets/${id}`);
}
