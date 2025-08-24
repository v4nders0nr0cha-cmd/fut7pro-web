// src/hooks/useRacha.ts

import useSWR from "swr";
import { apiClient } from "@/lib/api";
import type { Racha } from "@/types/racha";
import { rachaSchema } from "@/lib/validations/racha";

// Fetcher customizado que usa o apiClient para aplicar normalização
async function fetcher(url: string): Promise<Racha> {
  // Extrair o endpoint da URL completa
  const endpoint = url.replace(/^https?:\/\/[^\/]+/, "");
  const response = await apiClient.get(endpoint);

  if (response.error) {
    throw new Error(response.error);
  }

  const validation = rachaSchema.safeParse(response.data);
  if (!validation.success) {
    throw new Error(`Dados inválidos: ${validation.error}`);
  }

  return validation.data;
}

/**
 * Busca os detalhes de um racha específico.
 * @param rachaId string (id ou slug)
 */
export function useRacha(rachaId: string) {
  const { data, error, mutate, isLoading } = useSWR(
    rachaId ? `/api/rachas/${rachaId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 segundos
      errorRetryCount: 3,
      errorRetryInterval: 5000, // 5 segundos
    },
  );

  return {
    racha: data,
    isLoading,
    isError: error,
    error: error?.message,
    mutate,
  };
}
