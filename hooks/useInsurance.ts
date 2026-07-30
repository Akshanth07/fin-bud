"use client";
import { useQuery } from "@tanstack/react-query";
import { getInsurancePolicies } from "@/lib/api/insurance";
import { mockInsurancePolicies } from "@/lib/mock-data";

export function useInsurance() {
  const query = useQuery({
    queryKey: ["insurance-policies"],
    queryFn: getInsurancePolicies,
    retry: false,
  });
  return { ...query, data: query.data || [] };
}
