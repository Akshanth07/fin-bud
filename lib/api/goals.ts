import { apiClient } from "./client";

export interface GoalData {
  id: string;
  goal_name: string;
  goal_type?: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category?: string;
  priority?: string;
  monthly_contribution?: number;
  created_at?: string;
}

export interface GoalCreatePayload {
  goal_name: string;
  goal_type?: string;
  target_amount: number;
  current_amount?: number;
  target_date: string;
  category?: string;
  priority?: string;
  monthly_contribution?: number;
}

export interface GoalUpdatePayload {
  goal_name?: string;
  goal_type?: string;
  target_amount?: number;
  current_amount?: number;
  target_date?: string;
  category?: string;
  priority?: string;
  monthly_contribution?: number;
}

export interface GoalPredictionData {
  goal_id: string;
  projected_completion_date: string;
  on_track: boolean;
  shortfall_amount?: number;
  recommended_monthly_saving?: number;
}

export async function getGoals(): Promise<GoalData[]> {
  try {
    const res = await apiClient.get("/goals");
    return res.data?.data || res.data || [];
  } catch (e) {
    console.warn("Failed to get goals:", e);
    return [];
  }
}

export async function createGoal(payload: GoalCreatePayload): Promise<GoalData> {
  const res = await apiClient.post("/goals", payload);
  return res.data?.data || res.data;
}

export async function updateGoal(id: string, payload: GoalUpdatePayload): Promise<GoalData> {
  const res = await apiClient.put(`/goals/${id}`, payload);
  return res.data?.data || res.data;
}

export async function deleteGoal(id: string): Promise<void> {
  await apiClient.delete(`/goals/${id}`);
}

export async function addGoalContribution(id: string, amount: number): Promise<GoalData> {
  const res = await apiClient.post(`/goals/${id}/contribute`, { amount });
  return res.data?.data || res.data;
}

export async function getGoalPrediction(goalId: string): Promise<GoalPredictionData | null> {
  try {
    const res = await apiClient.get(`/goals/${goalId}/prediction`);
    return res.data?.data || res.data || null;
  } catch (e) {
    console.warn(`Failed to get prediction for goal ${goalId}:`, e);
    return null;
  }
}
