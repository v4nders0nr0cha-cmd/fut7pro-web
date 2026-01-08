// src/hooks/useFinanceiroPublic.ts

import useSWR from "swr";
import type { ResumoFinanceiro, LancamentoFinanceiro } from "@/components/financeiro/types";

interface FinanceiroPublicData {
  tenant?: {
    id?: string;
    slug?: string;
    name?: string;
  };
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
      date?: string;
      description?: string;
      value?: number;
      type?: string;
      category?: string;
    }
  >;
}

type FetchError = Error & { status?: number };

async function fetcher(url: string): Promise<FinanceiroPublicData> {
  const res = await fetch(url);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Erro desconhecido" }));
    const message = errorData.message || `HTTP ${res.status}: ${res.statusText}`;
    const error = new Error(message) as FetchError;
    error.status = res.status;
    throw error;
  }

  return res.json();
}

/**
 * Busca dados financeiros publicos de um racha especifico.
 * @param slug string (slug do racha)
 */
export function useFinanceiroPublic(slug: string) {
  const slugValue = slug?.trim();
  const { data, error, mutate, isLoading } = useSWR(
    slugValue ? `/api/public/${encodeURIComponent(slugValue)}/financeiro` : null,
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
    data: l.data ?? l.date ?? "",
    tipo: l.tipo ?? l.type ?? "",
    descricao: l.descricao ?? l.description ?? "",
    valor: l.valor ?? l.value ?? 0,
    responsavel: l.responsavel ?? l.adminNome ?? "N/D",
    comprovanteUrl: l.comprovanteUrl,
  }));

  return {
    tenant: data?.tenant ?? null,
    resumo,
    lancamentos,
    isLoading,
    isError: error,
    isNotFound: Boolean((error as FetchError | undefined)?.status === 404),
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}

// Reexporta o tipo usado na pagina publica
export type { LancamentoFinanceiro };
