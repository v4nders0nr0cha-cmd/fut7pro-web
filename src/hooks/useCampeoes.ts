"use client";

import useSWR from "swr";
import { useRacha } from "@/context/RachaContext";
import { campeoesApi, apiClient } from "@/lib/api";
import { useApiState } from "./useApiState";
import { campeoesMock } from "@/components/lists/mockCampeoes";
import type { Campeao } from "@/types/campeao";

// Fetcher customizado que implementa fallback para mocks
const fetcher = async (url: string): Promise<Campeao[]> => {
  try {
    // Tentar o backend primeiro
    const endpoint = url
      .replace(/^https?:\/\/[^\/]+/, "")
      .replace(/^\/api/, "");
    const response = await apiClient.get(endpoint);

    if (response.error) {
      throw new Error(response.error);
    }

    // Se chegou aqui, o backend funcionou
    return response.data as Campeao[];
  } catch (error) {
    // Se o backend falhou, usar mocks padronizados
    console.log("🔄 Backend falhou, usando mocks:", error);
    return campeoesMock;
  }
};

export function useCampeoes() {
  const { rachaId } = useRacha();
  const apiState = useApiState();

  // Sempre tentar buscar dados, mas com fallback para mocks
  const { data, error, isLoading, mutate } = useSWR<Campeao[]>(
    `/api/campeoes?rachaId=${rachaId || "demo"}`,
    fetcher,
    {
      onError: (err) => {
        if (process.env.NODE_ENV === "development") {
          console.log("Erro ao carregar campeões:", err);
        }
      },
      // Configurações para melhor experiência do usuário
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // 30 segundos
    },
  );

  const campeoesDisponiveis = data || campeoesMock;
  const temErroBackend = !!error;
  const carregandoBackend = isLoading;

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
    return campeoesDisponiveis.find((c) => c.id === id);
  };

  return {
    campeoes: campeoesDisponiveis,
    isLoading: carregandoBackend || apiState.isLoading,
    isError: temErroBackend || apiState.isError,
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
