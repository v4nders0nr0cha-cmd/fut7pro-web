// src/hooks/useFinanceiroPublic.ts

import useSWR from "swr";

export interface LancamentoFinanceiro {
  id: string;
  tipo: string;
  categoria: string;
  valor: number;
  descricao?: string;
  data: string;
  criadoEm: string;
  adminNome: string;
  adminEmail: string;
}

interface ResumoFinanceiro {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  totalLancamentos: number;
}

interface FinanceiroPublicData {
  resumo: ResumoFinanceiro;
  lancamentos: LancamentoFinanceiro[];
}

async function fetcher(url: string): Promise<FinanceiroPublicData> {
  const res = await fetch(url);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Erro desconhecido" }));
    throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

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
    }
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
