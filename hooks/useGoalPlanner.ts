"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addGoalContribution,
  getGoalPrediction,
  GoalData,
  GoalCreatePayload,
  GoalUpdatePayload,
  GoalPredictionData,
} from "@/lib/api/goals";

export function useGoalPlanner() {
  const queryClient = useQueryClient();

  const goalsQuery = useQuery({
    queryKey: ["goals"],
    queryFn: getGoals,
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: (payload: GoalCreatePayload) => createGoal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: GoalUpdatePayload }) => updateGoal(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["goal-prediction", variables.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  const contributeMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => addGoalContribution(id, amount),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["goal-prediction", variables.id] });
    },
  });

  return {
    ...goalsQuery,
    goals: goalsQuery.data || [],
    createGoal: createMutation.mutateAsync,
    updateGoal: updateMutation.mutateAsync,
    deleteGoal: deleteMutation.mutateAsync,
    addContribution: contributeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isContributing: contributeMutation.isPending,
  };
}

export function useGoalPrediction(goalId?: string) {
  return useQuery<GoalPredictionData | null>({
    queryKey: ["goal-prediction", goalId],
    queryFn: () => (goalId ? getGoalPrediction(goalId) : Promise.resolve(null)),
    enabled: Boolean(goalId),
    retry: 1,
  });
}
