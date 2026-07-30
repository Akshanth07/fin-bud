"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPolicies,
  getPolicy,
  uploadPolicyDocument,
  createPolicy,
  updatePolicy,
  deletePolicy,
  InsurancePolicyData,
  OCRUploadResponseData,
} from "@/lib/api/insurance";

export function useInsurancePolicies() {
  const queryClient = useQueryClient();

  const policiesQuery = useQuery({
    queryKey: ["insurance-policies"],
    queryFn: getPolicies,
    retry: 1,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadPolicyDocument(file),
  });

  const createMutation = useMutation({
    mutationFn: (payload: Partial<InsurancePolicyData>) => createPolicy(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance-policies"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload, data }: { id: string; payload?: Partial<InsurancePolicyData>; data?: Partial<InsurancePolicyData> }) =>
      updatePolicy(id, payload || data || {}),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["insurance-policies"] });
      queryClient.invalidateQueries({ queryKey: ["policy-detail", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance-policies"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  return {
    policies: policiesQuery.data?.policies || [],
    portfolioAnalysis: policiesQuery.data?.portfolio_analysis,
    isLoading: policiesQuery.isLoading,
    isError: policiesQuery.isError,
    uploadDocument: uploadMutation.mutateAsync,
    createPolicy: createMutation.mutateAsync,
    updatePolicy: updateMutation.mutateAsync,
    deletePolicy: deleteMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useInsurancePolicyDetail(id: string) {
  return useQuery<InsurancePolicyData>({
    queryKey: ["policy-detail", id],
    queryFn: () => getPolicy(id),
    enabled: Boolean(id),
    retry: 1,
  });
}
