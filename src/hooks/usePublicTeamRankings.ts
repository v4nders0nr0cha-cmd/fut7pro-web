"use client";

import useSWR from "swr";

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

interface PublicTeamEntry {
  id: string;
  nome: string;
  logo: string | null;
  cor: string | null;
}

interface PublicTeamsResponse {
  slug: string;
  results: PublicTeamEntry[];
  total: number;
  updatedAt: string | null;
}

const fetcher = async (url: string): Promise<TeamRankingsResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Erro ao carregar classificacao dos times");
  }
  return res.json();
};

const teamsFetcher = async (url: string): Promise<PublicTeamsResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Erro ao carregar times do racha");
  }
  return res.json();
};

export interface UsePublicTeamRankingsOptions {
  slug?: string;
  year?: number;
  period?: "all" | "year" | "quarter";
  quarter?: number;
}

export function usePublicTeamRankings(options: UsePublicTeamRankingsOptions = {}) {
  const slug = options.slug?.trim() || "";

  const params = new URLSearchParams();
  const isAllPeriod = options.period === "all";
  if (options.period) params.set("period", options.period);
  if (!isAllPeriod && options.year) params.set("year", String(options.year));
  if (!isAllPeriod && options.quarter) params.set("quarter", String(options.quarter));

  const search = params.toString();
  const key = slug ? `/api/public/${slug}/team-rankings${search ? `?${search}` : ""}` : null;
  const teamsKey = slug ? `/api/public/${slug}/teams` : null;

  const { data, error, isLoading } = useSWR<TeamRankingsResponse>(key, fetcher, {
    revalidateOnFocus: false,
  });

  const { data: teamsData, isLoading: teamsLoading } = useSWR<PublicTeamsResponse>(
    teamsKey,
    teamsFetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const rankingResults = data?.results ?? [];
  const teamResults = teamsData?.results ?? [];
  const rankingIds = new Set(rankingResults.map((entry) => entry.id));
  const missingTeams = teamResults
    .filter((team) => !rankingIds.has(team.id))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  const mergedTeams = [
    ...rankingResults,
    ...missingTeams.map((team) => ({
      id: team.id,
      rankingId: `zero-${team.id}`,
      nome: team.nome,
      logo: team.logo,
      cor: team.cor,
      pontos: 0,
      jogos: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      posicao: 0,
      aproveitamento: 0,
      updatedAt: null,
    })),
  ].map((entry, index) => ({
    ...entry,
    posicao: index + 1,
  }));

  const shouldWaitTeams = !rankingResults.length && teamsLoading;
  const loading = isLoading || shouldWaitTeams;

  return {
    teams: mergedTeams,
    updatedAt: data?.updatedAt ?? null,
    availableYears: data?.availableYears ?? [],
    isLoading: loading,
    isError: !!error,
    error: error instanceof Error ? error.message : null,
  };
}
