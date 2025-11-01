"use client";

import useSWR from "swr";
import { campeoesApi } from "@/lib/api";

export interface ChampionSummary {
  year: number;
  availableYears: number[];
  annual: Array<{
    id: string;
    title: string;
    icon: string | null;
    value: number | null;
    athlete: {
      id: string;
      name: string;
      nickname: string | null;
      slug: string | null;
      photoUrl: string | null;
    } | null;
  }>;
  quarters: Array<{
    quarter: number;
    items: Array<{
      id: string;
      title: string;
      icon: string | null;
      value: number | null;
      athlete: {
        id: string;
        name: string;
        nickname: string | null;
        slug: string | null;
        photoUrl: string | null;
      } | null;
    }>;
  }>;
}

const fetcher = async (year?: number): Promise<ChampionSummary> => {
  const params = year ? { year: String(year) } : undefined;
  const response = await campeoesApi.getResumo(params);
  if (response.error || !response.data) {
    throw new Error(response.error ?? "Erro ao carregar resumo de campeoes");
  }
  return response.data as ChampionSummary;
};

export function useAdminChampions(year?: number) {
  const key = ["admin-champions", year ?? "latest"];
  const { data, error, isLoading, mutate } = useSWR<ChampionSummary>(key, () => fetcher(year), {
    revalidateOnFocus: false,
  });

  return {
    data,
    isLoading,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}
