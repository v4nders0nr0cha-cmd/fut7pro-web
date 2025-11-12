"use client";

import useSWR from "swr";
import type { TeamRankingResponse } from "@/types/ranking";

const JSON_CT = "application/json";

async function fetcher(url: string): Promise<TeamRankingResponse> {
  const response = await fetch(url, {
    headers: { Accept: JSON_CT },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData && typeof errorData.error === "string"
        ? errorData.error
        : "Erro ao carregar classificação dos times") as string
    );
  }

  return response.json();
}

export function usePublicTeamRankings(slug: string | null | undefined) {
  const key = slug ? `/api/public/team-rankings?slug=${encodeURIComponent(slug)}` : null;
  const { data, error, isLoading, mutate } = useSWR<TeamRankingResponse>(key, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data,
    rankings: data?.results ?? [],
    updatedAt: data?.updatedAt ?? null,
    availableYears: data?.availableYears ?? [],
    isLoading,
    isError: !!error,
    error: error?.message ?? null,
    mutate,
  };
}
