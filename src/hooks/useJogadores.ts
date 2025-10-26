"use client";

import useSWR from "swr";
import { jogadoresApi } from "@/lib/api";
import { useApiState } from "./useApiState";
import type { Jogador } from "@/types/jogador";

const fetcher = async (rachaId: string) => {
  const response = await jogadoresApi.getAll(rachaId);
  if (response.error) {
    throw new Error(response.error);
  }
  return (response.data ?? []) as Jogador[];
};

export function useJogadores(rachaId: string) {
  const apiState = useApiState();

  const { data, error, isLoading, mutate } = useSWR<Jogador[]>(
    rachaId ? ["admin-jogadores", rachaId] : null,
    () => fetcher(rachaId),
    {
      onError: (err) => {
        if (process.env.NODE_ENV === "development") {
          console.log("Erro ao carregar jogadores:", err);
        }
      },
    }
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
