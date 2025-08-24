"use client";

import useSWR from "swr";
import { useRacha } from "@/context/RachaContext";
import { jogadoresApi, apiClient } from "@/lib/api";
import { useApiState } from "./useApiState";
import type { Jogador } from "@/types/jogador";

// Fetcher customizado que usa o apiClient para aplicar normalização
const fetcher = async (url: string) => {
  // Extrair o endpoint da URL completa
  const endpoint = url.replace(/^https?:\/\/[^\/]+/, "");
  const response = await apiClient.get(endpoint);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data;
};

export function useJogadores(rachaId: string) {
  const apiState = useApiState();

  const { data, error, isLoading, mutate } = useSWR<Jogador[]>(
    rachaId ? `/api/jogadores?rachaId=${rachaId}` : null,
    fetcher,
    {
      onError: (err) => {
        if (process.env.NODE_ENV === "development") {
          console.log("Erro ao carregar jogadores:", err);
        }
      },
    },
  );

  const addJogador = async (jogador: Partial<Jogador>) => {
    if (!rachaId) return null;

    return apiState.handleAsync(async () => {
      const response = await jogadoresApi.create({
        ...jogador,
        rachaId,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      await mutate();
      return response.data;
    });
  };

  const updateJogador = async (id: string, jogador: Partial<Jogador>) => {
    return apiState.handleAsync(async () => {
      const response = await jogadoresApi.update(id, {
        ...jogador,
        rachaId,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      await mutate();
      return response.data;
    });
  };

  const deleteJogador = async (id: string) => {
    return apiState.handleAsync(async () => {
      const response = await jogadoresApi.delete(id);

      if (response.error) {
        throw new Error(response.error);
      }

      await mutate();
      return response.data;
    });
  };

  const getJogadoresPorTime = (timeId: string) => {
    return (data || []).filter((j) => j.timeId === timeId);
  };

  return {
    jogadores: data || [],
    isLoading: isLoading || apiState.isLoading,
    isError: !!error || apiState.isError,
    error: apiState.error,
    isSuccess: apiState.isSuccess,
    addJogador,
    updateJogador,
    deleteJogador,
    getJogadoresPorTime,
    mutate,
    reset: apiState.reset,
  };
}
