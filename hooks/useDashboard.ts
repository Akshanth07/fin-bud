"use client";
import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary, getDashboardChart, CalculatedDashboardSummary } from "@/lib/api/dashboard";

export function useDashboard() {
  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
    retry: false,
  });

  return {
    ...summaryQuery,
    summary: summaryQuery.data,
  };
}

export function useDashboardChart(chartType: string) {
  return useQuery({
    queryKey: ["dashboard-chart", chartType],
    queryFn: () => getDashboardChart(chartType),
    retry: false,
  });
}
