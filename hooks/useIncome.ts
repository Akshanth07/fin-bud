"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getIncomeSources, createIncomeSource, updateIncomeSource, deleteIncomeSource, IncomeSource } from "@/lib/api/income";

export function useIncome() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["income-sources"],
    queryFn: getIncomeSources,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<IncomeSource>) => createIncomeSource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income-sources"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IncomeSource> }) => updateIncomeSource(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income-sources"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteIncomeSource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income-sources"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  return {
    ...query,
    incomeSources: query.data || [],
    createIncome: createMutation.mutateAsync,
    updateIncome: updateMutation.mutateAsync,
    deleteIncome: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
