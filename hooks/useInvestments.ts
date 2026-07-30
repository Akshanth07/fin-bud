"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInvestments, createInvestment, updateInvestment, deleteInvestment, InvestmentItem } from "@/lib/api/investments";

export function useInvestments() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["investments"],
    queryFn: getInvestments,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<InvestmentItem>) => createInvestment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InvestmentItem> }) => updateInvestment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInvestment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  return {
    ...query,
    investments: query.data || [],
    createInvestment: createMutation.mutateAsync,
    updateInvestment: updateMutation.mutateAsync,
    deleteInvestment: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
