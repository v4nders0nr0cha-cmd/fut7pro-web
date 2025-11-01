"use client";

import useSWR from "swr";
import type { PlayerRankingResponse, PlayerRankingType } from "@/types/ranking";
import type { PositionValue } from "@/constants/positions";

const JSON_CT = "application/json";

async function fetcher(url: string): Promise<PlayerRankingResponse> {
  const response = await fetch(url, {
    headers: { Accept: JSON_CT },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error ?? "Erro ao carregar ranking de atletas");
  }

  return response.json();
}

type UsePublicPlayerRankingsParams = {
  slug: string | null | undefined;
  type?: PlayerRankingType;
  limit?: number;
  position?: PositionValue | null;
  period?: "all" | "year" | "quarter" | "custom";
  year?: number;
  quarter?: number;
  start?: string | null;
  end?: string | null;
};

export function usePublicPlayerRankings({
  slug,
  type = "geral",
  limit,
  position,
  period,
  year,
  quarter,
  start,
  end,
}: UsePublicPlayerRankingsParams) {
  const search = new URLSearchParams();
  if (slug) search.set("slug", slug);
  if (type) search.set("type", type);
  if (limit) search.set("limit", String(limit));
  if (position) search.set("position", position);
  if (period) search.set("period", period);
  if (typeof year === "number" && !Number.isNaN(year)) search.set("year", String(year));
  if (typeof quarter === "number" && !Number.isNaN(quarter)) search.set("quarter", String(quarter));
  if (start) search.set("start", start);
  if (end) search.set("end", end);

  const key = slug ? `/api/public/player-rankings?${search.toString()}` : null;

  const { data, error, isLoading, mutate } = useSWR<PlayerRankingResponse>(key, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data,
    rankings: data?.results ?? [],
    availableYears: data?.availableYears ?? [],
    appliedPeriod: data?.appliedPeriod,
    isLoading,
    isError: !!error,
    error: error?.message ?? null,
    mutate,
  };
}
