"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSchemes,
  getRecommendedSchemes,
  getSavedSchemes,
  getScheme,
  saveScheme,
  unsaveScheme,
  updateSavedStatus,
  GovernmentSchemeData,
  RecommendedSchemeData,
  SavedSchemeData,
} from "@/lib/api/government";

export function useGovernmentSchemes(params?: {
  category?: string;
  state?: string;
  eligible_only?: boolean;
  search?: string;
}) {
  const queryClient = useQueryClient();

  const recommendedQuery = useQuery({
    queryKey: ["recommended-schemes", params],
    queryFn: () => getRecommendedSchemes(params),
    retry: 1,
  });

  const savedQuery = useQuery({
    queryKey: ["saved-schemes"],
    queryFn: getSavedSchemes,
    retry: 1,
  });

  const saveMutation = useMutation({
    mutationFn: ({ schemeId, status }: { schemeId: string; status?: string }) => saveScheme(schemeId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommended-schemes"] });
      queryClient.invalidateQueries({ queryKey: ["saved-schemes"] });
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: (schemeId: string) => unsaveScheme(schemeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommended-schemes"] });
      queryClient.invalidateQueries({ queryKey: ["saved-schemes"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ schemeId, status }: { schemeId: string; status: string }) => updateSavedStatus(schemeId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommended-schemes"] });
      queryClient.invalidateQueries({ queryKey: ["saved-schemes"] });
    },
  });

  return {
    recommended: recommendedQuery.data || [],
    saved: savedQuery.data || [],
    isLoadingRecommended: recommendedQuery.isLoading,
    isLoadingSaved: savedQuery.isLoading,
    isError: recommendedQuery.isError,
    saveScheme: saveMutation.mutateAsync,
    unsaveScheme: unsaveMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    isUnsaving: unsaveMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
}

export function useGovernmentSchemeDetail(id: string) {
  return useQuery<GovernmentSchemeData>({
    queryKey: ["scheme-detail", id],
    queryFn: () => getScheme(id),
    enabled: Boolean(id),
    retry: 1,
  });
}
