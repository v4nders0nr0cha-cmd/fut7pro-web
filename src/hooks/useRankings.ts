"use client";

import useSWR from "swr";
import { useRacha } from "@/context/RachaContext";
import { rankingsApi } from "@/lib/api";
import { useApiState } from "./useApiState";
import type { Ranking } from "@/types/ranking";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erro ao buscar rankings");
  }
  return response.json();
};

export function useRankings() {
  const { rachaId } = useRacha();
  const apiState = useApiState();

  const {
    data: rankingGeral,
    error: errorGeral,
    isLoading: isLoadingGeral,
    mutate: mutateGeral,
  } = useSWR<Ranking[]>(rachaId ? `/api/rankings/geral?rachaId=${rachaId}` : null, fetcher, {
    onError: (err) => {
      if (process.env.NODE_ENV === "development") {
        console.log("Erro ao carregar ranking geral:", err);
      }
    },
  });

  const {
    data: rankingArtilheiros,
    error: errorArtilheiros,
    isLoading: isLoadingArtilheiros,
    mutate: mutateArtilheiros,
  } = useSWR<Ranking[]>(rachaId ? `/api/rankings/artilheiros?rachaId=${rachaId}` : null, fetcher, {
    onError: (err) => {
      if (process.env.NODE_ENV === "development") {
        console.log("Erro ao carregar ranking artilheiros:", err);
      }
    },
  });

  const {
    data: rankingAssistencias,
    error: errorAssistencias,
    isLoading: isLoadingAssistencias,
    mutate: mutateAssistencias,
  } = useSWR<Ranking[]>(rachaId ? `/api/rankings/assistencias?rachaId=${rachaId}` : null, fetcher, {
    onError: (err) => {
      if (process.env.NODE_ENV === "development") {
        console.log("Erro ao carregar ranking assistências:", err);
      }
    },
  });

  const {
    data: rankingTimes,
    error: errorTimes,
    isLoading: isLoadingTimes,
    mutate: mutateTimes,
  } = useSWR<Ranking[]>(rachaId ? `/api/rankings/times?rachaId=${rachaId}` : null, fetcher, {
    onError: (err) => {
      if (process.env.NODE_ENV === "development") {
        console.log("Erro ao carregar ranking times:", err);
      }
    },
  });

  const isLoading =
    isLoadingGeral || isLoadingArtilheiros || isLoadingAssistencias || isLoadingTimes;
  const isError = !!errorGeral || !!errorArtilheiros || !!errorAssistencias || !!errorTimes;

  const refreshAll = async () => {
    await Promise.all([mutateGeral(), mutateArtilheiros(), mutateAssistencias(), mutateTimes()]);
  };

  return {
    rankingGeral: rankingGeral || [],
    rankingArtilheiros: rankingArtilheiros || [],
    rankingAssistencias: rankingAssistencias || [],
    rankingTimes: rankingTimes || [],
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
