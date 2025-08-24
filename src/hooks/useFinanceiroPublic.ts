// src/hooks/useFinanceiroPublic.ts

import useSWR from "swr";
import { apiClient } from "@/lib/api";
import type { LancamentoFinanceiro } from "@/types/financeiro";

interface FinanceiroPublicData {
  resumo: {
    saldo: number;
    entradas: number;
    saidas: number;
    totalLancamentos: number;
  };
  lancamentos: LancamentoFinanceiro[];
}

// Fetcher customizado que usa o apiClient para aplicar normalização
const fetcher = async (url: string): Promise<FinanceiroPublicData> => {
  // Extrair o endpoint da URL completa
  const endpoint = url.replace(/^https?:\/\/[^\/]+/, "");
  const response = await apiClient.get(endpoint);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data;
};

/**
 * Busca dados financeiros públicos de um racha específico.
 * @param rachaId string (ID do racha)
 */
export function useFinanceiroPublic(rachaId: string) {
  const { data, error, mutate, isLoading } = useSWR(
    rachaId ? `/api/public/financeiro/${rachaId}` : null,
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
    resumo: data?.resumo,
    lancamentos: data?.lancamentos || [],
    isLoading,
    isError: error,
    error: error?.message,
    mutate,
  };
}
