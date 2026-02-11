"use client";

import useSWR from "swr";
import { useRacha } from "@/context/RachaContext";
import { campeoesApi } from "@/lib/api";
import { useApiState } from "./useApiState";
import type { Campeao } from "@/types/campeao";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erro ao buscar campeões");
  }
  return response.json();
};

export function useCampeoes() {
  const { rachaId } = useRacha();
  const apiState = useApiState();

  const { data, error, isLoading, mutate } = useSWR<Campeao[]>(
    rachaId ? `/api/campeoes?rachaId=${rachaId}` : null,
    fetcher,
    {
      onError: (err) => {
        if (process.env.NODE_ENV === "development") {
          console.error("Erro ao carregar campeões:", err);
        }
      },
    }
  );

  const addCampeao = async (campeao: Partial<Campeao>) => {
    if (!rachaId) return null;

    return apiState.handleAsync(async () => {
      const response = await campeoesApi.create({
        ...campeao,
        rachaId,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      await mutate();
      return response.data;
    });
  };

  const updateCampeao = async (id: string, campeao: Partial<Campeao>) => {
    return apiState.handleAsync(async () => {
      const response = await campeoesApi.update(id, {
        ...campeao,
        rachaId,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      await mutate();
      return response.data;
    });
  };

  const deleteCampeao = async (id: string) => {
    return apiState.handleAsync(async () => {
      const response = await campeoesApi.delete(id);

      if (response.error) {
        throw new Error(response.error);
      }

      await mutate();
      return response.data;
    });
  };

  const getCampeaoById = (id: string) => {
    return data?.find((c) => c.id === id);
  };

  return {
    campeoes: data || [],
    isLoading: isLoading || apiState.isLoading,
    isError: !!error || apiState.isError,
    error: apiState.error,
    isSuccess: apiState.isSuccess,
    mutate,
    addCampeao,
    updateCampeao,
    deleteCampeao,
    getCampeaoById,
    reset: apiState.reset,
  };
}
