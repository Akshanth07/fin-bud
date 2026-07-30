"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSimulations,
  createSimulation,
  deleteSimulation,
  LifeEventSimulationItem,
} from "@/lib/api/life-events";

export function useLifeEvents() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["life-events-simulations"],
    queryFn: getSimulations,
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: (payload: { event_type: string; input_data: Record<string, any>; ai_result?: Record<string, any> }) =>
      createSimulation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["life-events-simulations"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSimulation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["life-events-simulations"] });
    },
  });

  return {
    ...query,
    simulations: query.data || [],
    createSimulation: createMutation.mutateAsync,
    deleteSimulation: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
