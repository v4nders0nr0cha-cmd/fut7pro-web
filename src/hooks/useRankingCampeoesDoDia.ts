"use client";

import useSWR from "swr";
import type {
  RankingCampeaoDoDiaItem,
  RankingCampeoesPeriodo,
} from "@/lib/campeoes-do-dia-ranking";

type RankingCampeoesResponse = {
  periodo: RankingCampeoesPeriodo;
  range: { from: string; to: string; year: number };
  total: number;
  maiorNumeroCampeoesDaTemporada: number;
  rankings: RankingCampeaoDoDiaItem[];
};

const fetcher = async (url: string): Promise<RankingCampeoesResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Erro ao carregar Ranking Campeoes do Dia");
  }
  return res.json();
};

export function useRankingCampeoesDoDia(options?: {
  periodo?: RankingCampeoesPeriodo;
  enabled?: boolean;
}) {
  const enabled = options?.enabled ?? true;
  const periodo = options?.periodo ?? "ano";
  const key = enabled ? `/api/admin/jogadores/ranking-campeoes-do-dia?periodo=${periodo}` : null;
  const { data, error, isLoading } = useSWR<RankingCampeoesResponse>(key, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 10000,
  });

  return {
    rankings: data?.rankings ?? [],
    total: data?.total ?? 0,
    range: data?.range ?? null,
    maiorNumeroCampeoesDaTemporada: data?.maiorNumeroCampeoesDaTemporada ?? 0,
    isLoading: enabled ? isLoading : false,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
  };
}
