import useSWR from "swr";
import type { AdminAnalyticsResponse, AnalyticsPeriod } from "@/types/analytics";
import { useRacha } from "@/context/RachaContext";

const fetcher = async (url: string): Promise<AdminAnalyticsResponse> => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Falha ao carregar relatorio (${response.status})`);
  return response.json();
};

type Options = {
  period?: AnalyticsPeriod;
};

export function useAdminAnalytics(options?: Options) {
  const { tenantSlug } = useRacha();
  const period = options?.period ?? "year";

  const params = new URLSearchParams();
  params.set("period", period);
  if (tenantSlug) params.set("slug", tenantSlug);

  const { data, error, mutate, isValidating } = useSWR<AdminAnalyticsResponse>(
    `/api/admin/analytics?${params.toString()}`,
    fetcher
  );

  return {
    analytics: data,
    isLoading: !error && !data,
    isError: !!error,
    isValidating,
    mutate,
  };
}
