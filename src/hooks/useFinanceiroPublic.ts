// src/hooks/useFinanceiroPublic.ts

import useSWR from "swr";
import type { ResumoFinanceiro, LancamentoFinanceiro } from "@/components/financeiro/types";

interface FinanceiroPublicData {
  resumo: {
    saldo?: number;
    saldoAtual?: number;
    totalReceitas?: number;
    totalDespesas?: number;
    receitasPorMes?: Record<string, number>;
    despesasPorMes?: Record<string, number>;
  };
  lancamentos: Array<
    LancamentoFinanceiro & {
      categoria?: string;
      adminNome?: string;
      adminEmail?: string;
    }
  >;
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

  const resumo: ResumoFinanceiro | undefined = data
    ? {
        saldoAtual: data.resumo.saldoAtual ?? data.resumo.saldo ?? 0,
        totalReceitas: data.resumo.totalReceitas ?? 0,
        totalDespesas: data.resumo.totalDespesas ?? 0,
        receitasPorMes: data.resumo.receitasPorMes ?? {},
        despesasPorMes: data.resumo.despesasPorMes ?? {},
      }
    : undefined;

  const lancamentos: LancamentoFinanceiro[] = (data?.lancamentos || []).map((l) => ({
    id: l.id,
    data: l.data,
    tipo: l.tipo,
    descricao: l.descricao,
    valor: l.valor,
    responsavel: l.responsavel ?? l.adminNome ?? "N/D",
    comprovanteUrl: l.comprovanteUrl,
  }));

  return {
    resumo,
    lancamentos,
    isLoading,
    isError: error,
    error: error?.message,
    mutate,
  };
}

// Reexporta o tipo usado na pÃ¡gina pÃºblica
export type { LancamentoFinanceiro };
