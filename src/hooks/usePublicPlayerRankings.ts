"use client";

import useSWR from "swr";
import { rachaConfig } from "@/config/racha.config";
import type { RankingAtleta } from "@/types/estatisticas";

type PlayerRankingType = "geral" | "artilheiros" | "assistencias";
type PlayerRankingPeriod = "all" | "year" | "quarter" | "custom";

interface PlayerRankingsResponse {
  slug: string;
  type: PlayerRankingType;
  results: RankingAtleta[];
  total: number;
  availableYears?: number[];
  appliedPeriod?: Record<string, unknown> | null;
}

const fetcher = async (url: string): Promise<PlayerRankingsResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Erro ao carregar rankings de jogadores");
  }
  return res.json();
};

export interface UsePublicPlayerRankingsOptions {
  slug?: string;
  type: PlayerRankingType;
  period?: PlayerRankingPeriod;
  year?: number;
  quarter?: number;
  limit?: number;
  position?: string;
}

export function usePublicPlayerRankings(options: UsePublicPlayerRankingsOptions) {
  const slug = options.slug ?? rachaConfig.slug;

  const params = new URLSearchParams();
  params.set("type", options.type);
  if (options.period) params.set("period", options.period);
  if (options.year) params.set("year", String(options.year));
  if (options.quarter) params.set("quarter", String(options.quarter));
  if (options.limit) params.set("limit", String(options.limit));
  if (options.position) params.set("position", options.position);

  const key = slug ? `/api/public/${slug}/player-rankings?${params.toString()}` : null;

  const { data, error, isLoading } = useSWR<PlayerRankingsResponse>(key, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    rankings: data?.results ?? [],
    total: data?.total ?? 0,
    slug: data?.slug,
    type: data?.type,
    availableYears: data?.availableYears ?? [],
    appliedPeriod: data?.appliedPeriod ?? null,
    isLoading,
    isError: !!error,
    error: error instanceof Error ? error.message : null,
  };
}
