"use client";

import useSWR from "swr";
import { rachaConfig } from "@/config/racha.config";

export interface TeamRankingEntry {
  id: string;
  rankingId: string;
  nome: string;
  logo: string | null;
  cor: string | null;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  posicao: number;
  aproveitamento: number;
  updatedAt: string | null;
}

interface TeamRankingsResponse {
  slug: string;
  results: TeamRankingEntry[];
  updatedAt: string | null;
  availableYears?: number[];
}

const fetcher = async (url: string): Promise<TeamRankingsResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Erro ao carregar classificacao dos times");
  }
  return res.json();
};

export interface UsePublicTeamRankingsOptions {
  slug?: string;
  year?: number;
}

export function usePublicTeamRankings(options: UsePublicTeamRankingsOptions = {}) {
  const slug = options.slug ?? rachaConfig.slug;

  const params = new URLSearchParams();
  if (options.year) {
    params.set("year", String(options.year));
  }

  const search = params.toString();
  const key = slug ? `/api/public/${slug}/team-rankings${search ? `?${search}` : ""}` : null;

  const { data, error, isLoading } = useSWR<TeamRankingsResponse>(key, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    teams: data?.results ?? [],
    updatedAt: data?.updatedAt ?? null,
    availableYears: data?.availableYears ?? [],
    isLoading,
    isError: !!error,
    error: error instanceof Error ? error.message : null,
  };
}
