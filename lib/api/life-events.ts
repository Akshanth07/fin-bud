import { apiClient } from "./client";

export interface LifeEventSimulationItem {
  id: string;
  event_type: string;
  input_data: Record<string, any>;
  ai_result?: Record<string, any>;
  created_at?: string;
}

export async function getSimulations(): Promise<LifeEventSimulationItem[]> {
  try {
    const res = await apiClient.get("/life-events");
    return res.data?.data || res.data || [];
  } catch (e) {
    console.warn("Failed to get life events simulations:", e);
    return [];
  }
}

export async function createSimulation(payload: {
  event_type: string;
  input_data: Record<string, any>;
  ai_result?: Record<string, any>;
}): Promise<LifeEventSimulationItem> {
  const res = await apiClient.post("/life-events", payload);
  return res.data?.data || res.data;
}

export async function deleteSimulation(id: string): Promise<void> {
  await apiClient.delete(`/life-events/${id}`);
}
