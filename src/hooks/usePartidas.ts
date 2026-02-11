import useSWR from "swr";
import { useRacha } from "@/context/RachaContext";
import { partidasApi } from "@/lib/api";
import { useApiState } from "./useApiState";
import type { Partida } from "@/types/partida";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erro ao buscar partidas");
  }
  return response.json();
};

export function usePartidas() {
  const { rachaId } = useRacha();
  const apiState = useApiState();

  const { data, error, mutate, isLoading } = useSWR<Partida[]>(
    rachaId ? "/api/partidas" : null,
    fetcher,
    {
      onError: (err) => {
        if (process.env.NODE_ENV === "development") {
          console.error("Erro ao carregar partidas:", err);
        }
      },
    }
  );

  const addPartida = async (partida: Partial<Partida>) => {
    if (!rachaId) return null;

    return apiState.handleAsync(async () => {
      const response = await partidasApi.create(partida);

      if (response.error) {
        throw new Error(response.error);
      }

      await mutate();
      return response.data;
    });
  };

  const updatePartida = async (id: string, partida: Partial<Partida>) => {
    return apiState.handleAsync(async () => {
      const response = await partidasApi.update(id, partida);

      if (response.error) {
        throw new Error(response.error);
      }

      await mutate();
      return response.data;
    });
  };

  const deletePartida = async (id: string) => {
    return apiState.handleAsync(async () => {
      const response = await partidasApi.delete(id);

      if (response.error) {
        throw new Error(response.error);
      }

      await mutate();
      return response.data;
    });
  };

  const getPartidaById = (id: string) => {
    return data?.find((p) => p.id === id);
  };

  return {
    partidas: data || [],
    isLoading: isLoading || apiState.isLoading,
    isError: !!error || apiState.isError,
    error: apiState.error,
    isSuccess: apiState.isSuccess,
    mutate,
    addPartida,
    updatePartida,
    deletePartida,
    getPartidaById,
    reset: apiState.reset,
  };
}
