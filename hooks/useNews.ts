"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMarketNews,
  getMarketNewsAISummary,
  FetchMarketNewsParams,
  MarketNewsArticle,
  MarketNewsAISummary,
} from "@/lib/api/news";

export function useMarketNews(params?: FetchMarketNewsParams) {
  const query = useQuery<MarketNewsArticle[]>({
    queryKey: ["market-news", params?.search || "", params?.category || "All", params?.time_filter || "All Time", params?.sort || "latest"],
    queryFn: () => getMarketNews(params),
    staleTime: 1000 * 60 * 15, // 15 minutes cache (aligned with AI summary)
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return {
    articles: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useMarketNewsAISummary() {
  const queryClient = useQueryClient();

  const query = useQuery<MarketNewsAISummary>({
    queryKey: ["market-news-ai-summary"],
    queryFn: () => getMarketNewsAISummary(false),
    staleTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const refreshMutation = useMutation({
    mutationFn: () => getMarketNewsAISummary(true),
    onSuccess: (data) => {
      queryClient.setQueryData(["market-news-ai-summary"], data);
    },
  });

  return {
    aiSummary: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching || refreshMutation.isPending,
    isError: query.isError,
    refreshAISummary: refreshMutation.mutateAsync,
  };
}
