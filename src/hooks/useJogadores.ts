"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { jogadoresApi } from "@/lib/api";
import { useApiState } from "./useApiState";
import type { Jogador } from "@/types/jogador";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erro ao buscar jogadores");
  }
  return response.json();
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
    }
  );

  const jogadoresNormalizados = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((jogador: any) => {
      const nome = jogador?.nome ?? jogador?.name ?? jogador?.user?.name ?? "";
      const apelido = jogador?.apelido ?? jogador?.nickname ?? "";
      const posicao = jogador?.posicao ?? jogador?.position ?? "Meia";
      const avatar = jogador?.avatar ?? jogador?.photoUrl ?? jogador?.foto ?? "";
      const foto = jogador?.foto ?? jogador?.photoUrl ?? jogador?.avatar ?? undefined;
      const mensalista =
        typeof jogador?.mensalista === "boolean" ? jogador.mensalista : Boolean(jogador?.isMember);
      const status = jogador?.status ?? "Ativo";
      const email = jogador?.email ?? "";
      const timeId = jogador?.timeId ?? "";

      return {
        ...jogador,
        nome,
        apelido,
        posicao,
        avatar,
        foto,
        mensalista,
        status,
        email,
        timeId,
      } as Jogador;
    });
  }, [data]);

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
    jogadores: jogadoresNormalizados,
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
