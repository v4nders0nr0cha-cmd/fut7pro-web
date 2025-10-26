"use client";

import useSWR from "swr";
import { useTenant } from "@/hooks/useTenant";
import { rachaConfig } from "@/config/racha.config";
import { useApiState } from "./useApiState";

type PlayerRankingEntry = {
  id: string;
  nome: string;
  slug?: string;
  foto?: string;
  pontos?: number;
  gols?: number;
  assistencias?: number;
};

type TeamRankingEntry = {
  id: string;
  nome: string;
  logo?: string;
  pontos?: number;
  jogos?: number;
};

type RankingResponse<T> = {
  results: T[];
};

async function fetcher<T>(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Erro ao buscar rankings");
  }
  return (await response.json()) as RankingResponse<T>;
}

function buildPlayerUrl(slug: string, type: string, limit = 20) {
  const params = new URLSearchParams();
  params.set("slug", slug);
  params.set("type", type);
  params.set("limit", String(limit));
  return `/api/public/player-rankings?${params.toString()}`;
}

function buildTeamUrl(slug: string) {
  const params = new URLSearchParams();
  params.set("slug", slug);
  return `/api/public/team-rankings?${params.toString()}`;
}

export function useRankings() {
  const { tenant } = useTenant();
  const slug = tenant?.slug || rachaConfig.slug;
  const apiState = useApiState();

  const {
    data: rankingGeral,
    error: errorGeral,
    isLoading: isLoadingGeral,
    mutate: mutateGeral,
  } = useSWR<RankingResponse<PlayerRankingEntry>>(buildPlayerUrl(slug, "geral"), fetcher);

  const {
    data: rankingArtilheiros,
    error: errorArtilheiros,
    isLoading: isLoadingArtilheiros,
    mutate: mutateArtilheiros,
  } = useSWR<RankingResponse<PlayerRankingEntry>>(buildPlayerUrl(slug, "artilheiros"), fetcher);

  const {
    data: rankingAssistencias,
    error: errorAssistencias,
    isLoading: isLoadingAssistencias,
    mutate: mutateAssistencias,
  } = useSWR<RankingResponse<PlayerRankingEntry>>(buildPlayerUrl(slug, "assistencias"), fetcher);

  const {
    data: rankingTimes,
    error: errorTimes,
    isLoading: isLoadingTimes,
    mutate: mutateTimes,
  } = useSWR<RankingResponse<TeamRankingEntry>>(buildTeamUrl(slug), fetcher);

  const isLoading =
    isLoadingGeral || isLoadingArtilheiros || isLoadingAssistencias || isLoadingTimes;
  const isError = Boolean(errorGeral || errorArtilheiros || errorAssistencias || errorTimes);

  const refreshAll = async () => {
    await Promise.all([mutateGeral(), mutateArtilheiros(), mutateAssistencias(), mutateTimes()]);
  };

  return {
    rankingGeral: rankingGeral?.results ?? [],
    rankingArtilheiros: rankingArtilheiros?.results ?? [],
    rankingAssistencias: rankingAssistencias?.results ?? [],
    rankingTimes: rankingTimes?.results ?? [],
    isLoading,
    isError,
    error: apiState.error,
    isSuccess: apiState.isSuccess,
    refreshAll,
    mutateGeral,
    mutateArtilheiros,
    mutateAssistencias,
    mutateTimes,
    reset: apiState.reset,
  };
}
