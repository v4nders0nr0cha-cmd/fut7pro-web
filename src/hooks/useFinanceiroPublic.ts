// src/hooks/useFinanceiroPublic.ts

import useSWR from "swr";
import type {
  ResumoFinanceiro as ResumoFinanceiroUI,
  LancamentoFinanceiro as LancamentoFinanceiroUI,
} from "@/components/financeiro/types";

interface ApiResumoFinanceiro {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  totalLancamentos: number;
  saldoAtual?: number;
  receitasPorMes?: Record<string, number>;
  despesasPorMes?: Record<string, number>;
}

interface ApiLancamentoFinanceiro {
  id: string;
  tipo: string;
  categoria: string;
  valor: number;
  descricao?: string;
  data: string;
  criadoEm: string;
  adminNome?: string;
  adminEmail?: string;
  responsavel?: string;
  comprovanteUrl?: string | null;
}

interface FinanceiroPublicData {
  resumo: ApiResumoFinanceiro;
  lancamentos: ApiLancamentoFinanceiro[];
}

function adaptResumo(resumo: ApiResumoFinanceiro): ResumoFinanceiroUI {
  return {
    saldoAtual: resumo.saldoAtual ?? resumo.saldo ?? 0,
    totalReceitas: resumo.totalReceitas ?? 0,
    totalDespesas: resumo.totalDespesas ?? 0,
    receitasPorMes: resumo.receitasPorMes ?? {},
    despesasPorMes: resumo.despesasPorMes ?? {},
  };
}

function adaptLancamento(lancamento: ApiLancamentoFinanceiro): LancamentoFinanceiroUI {
  const categoria = lancamento.categoria ?? "outros";
  const tipoLower = lancamento.tipo?.toLowerCase() ?? "";
  const movimento: LancamentoFinanceiroUI["tipo"] =
    tipoLower === "saida" || tipoLower.startsWith("despesa") || tipoLower === "sistema"
      ? "saida"
      : "entrada";

  return {
    id: lancamento.id,
    data: lancamento.data,
    tipo: movimento,
    categoria,
    descricao: lancamento.descricao ?? "",
    valor: Math.abs(lancamento.valor ?? 0),
    responsavel:
      lancamento.responsavel ?? lancamento.adminNome ?? lancamento.adminEmail ?? "Administrador",
    comprovanteUrl: lancamento.comprovanteUrl ?? undefined,
    adminNome: lancamento.adminNome,
    adminEmail: lancamento.adminEmail,
  };
}

async function fetcher(url: string): Promise<{ resumo: ResumoFinanceiroUI; lancamentos: LancamentoFinanceiroUI[] }> {
  const res = await fetch(url);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Erro desconhecido" }));
    throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  const payload: FinanceiroPublicData = await res.json();
  return {
    resumo: adaptResumo(payload.resumo),
    lancamentos: Array.isArray(payload.lancamentos)
      ? payload.lancamentos.map(adaptLancamento)
      : [],
  };
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
    resumo: data?.resumo ?? null,
    lancamentos: data?.lancamentos ?? [],
    isLoading,
    isError: Boolean(error),
    error: error?.message,
    mutate,
  };
}
