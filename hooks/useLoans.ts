"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLoans, createLoan, updateLoan, deleteLoan, LoanItem } from "@/lib/api/loans";

export function useLoans() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["loans"],
    queryFn: getLoans,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<LoanItem>) => createLoan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LoanItem> }) => updateLoan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLoan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  return {
    ...query,
    loans: query.data || [],
    createLoan: createMutation.mutateAsync,
    updateLoan: updateMutation.mutateAsync,
    deleteLoan: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
