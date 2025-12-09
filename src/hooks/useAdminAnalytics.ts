import useSWR from "swr";
import type { AdminAnalyticsResponse, AnalyticsPeriod } from "@/types/analytics";
import { useRacha } from "@/context/RachaContext";

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((r) => r.json());

type Options = {
  period?: AnalyticsPeriod;
};

export function useAdminAnalytics(options?: Options) {
  const { tenantSlug } = useRacha();
  const period = options?.period ?? "week";

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
