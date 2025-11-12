import useSWR from "swr";
import type { SponsorMetricsSummary } from "@/types/patrocinador";

type Granularity = "day" | "week" | "month";

type UseSponsorMetricsParams = {
  tenantSlug: string | null | undefined;
  start?: string;
  end?: string;
  granularity?: Granularity;
  tier?: string | string[];
  sponsorId?: string;
};

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      (errorData && typeof errorData.error === "string"
        ? errorData.error
        : "Falha ao carregar metricas de patrocinadores") as string
    );
    throw Object.assign(error, { details: errorData?.details });
  }
  return (await response.json()) as SponsorMetricsSummary;
};

function normalizeTierParam(tier?: string | string[]) {
  if (!tier) return undefined;
  if (Array.isArray(tier)) {
    return tier.flatMap((value) =>
      value
        .split(",")
        .map((piece) => piece.trim())
        .filter((piece) => piece.length > 0)
    );
  }
  return tier
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export function useSponsorMetrics(params: UseSponsorMetricsParams) {
  const { tenantSlug, start, end, granularity, tier, sponsorId } = params;

  const tiers = normalizeTierParam(tier);
  const searchParams = new URLSearchParams();
  if (tenantSlug) {
    searchParams.set("slug", tenantSlug);
  }
  if (start) {
    searchParams.set("start", start);
  }
  if (end) {
    searchParams.set("end", end);
  }
  if (granularity) {
    searchParams.set("granularity", granularity);
  }
  if (sponsorId) {
    searchParams.set("sponsorId", sponsorId);
  }
  if (tiers && tiers.length > 0) {
    tiers.forEach((value) => searchParams.append("tier", value));
  }

  const key = tenantSlug ? `/api/admin/patrocinadores/metrics?${searchParams.toString()}` : null;
  const swr = useSWR<SponsorMetricsSummary>(key, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  return {
    metrics: swr.data ?? null,
    isLoading: swr.isLoading,
    isValidating: swr.isValidating,
    error: swr.error,
    mutate: swr.mutate,
  };
}
