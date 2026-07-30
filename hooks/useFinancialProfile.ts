"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFinancialProfile, updateFinancialProfile, UserProfileData } from "@/lib/api/financial";

export function useFinancialProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["financial-profile"],
    queryFn: getFinancialProfile,
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<UserProfileData>) => updateFinancialProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-profile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  return {
    ...query,
    profile: query.data,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
