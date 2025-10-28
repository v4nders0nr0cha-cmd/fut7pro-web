"use client";

import useSWR from "swr";
import { useApiState } from "./useApiState";
import type { Jogador } from "@/types/jogador";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erro ao buscar jogadores");
  }
  return response.json();
};

export function useJogadores(tenantSlug: string | null | undefined) {
  const apiState = useApiState();

  const { data, error, isLoading, mutate } = useSWR<Jogador[]>(
    tenantSlug ? `/api/admin/jogadores?slug=${tenantSlug}` : null,
    fetcher,
    {
      onError: (err) => {
        if (process.env.NODE_ENV === "development") {
          console.log("Erro ao carregar jogadores:", err);
        }
      },
    }
  );

  const addJogador = async (jogador: Partial<Jogador>) => {
    if (!tenantSlug) return null;

    return apiState.handleAsync(async () => {
      const response = await fetch(`/api/admin/jogadores?slug=${tenantSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jogador),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? "Erro ao criar jogador");
      }

      await mutate();
      return response.json();
    });
  };

  const updateJogador = async (id: string, jogador: Partial<Jogador>) => {
    if (!tenantSlug) return null;

    return apiState.handleAsync(async () => {
      const response = await fetch(`/api/admin/jogadores?slug=${tenantSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...jogador }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? "Erro ao atualizar jogador");
      }

      await mutate();
      return response.json();
    });
  };

  const deleteJogador = async (id: string) => {
    if (!tenantSlug) return null;

    return apiState.handleAsync(async () => {
      const response = await fetch(`/api/admin/jogadores?slug=${tenantSlug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? "Erro ao excluir jogador");
      }

      await mutate();
      return null;
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
