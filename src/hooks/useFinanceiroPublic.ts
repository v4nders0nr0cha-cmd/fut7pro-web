// src/hooks/useFinanceiroPublic.ts

import useSWR from "swr";
import type { ResumoFinanceiro, LancamentoFinanceiro } from "@/components/financeiro/types";

type PublicFinanceiroState =
  | "AVAILABLE"
  | "NO_DATA"
  | "MODULE_DISABLED"
  | "SLUG_NOT_FOUND"
  | "UNAVAILABLE";

interface FinanceiroPublicData {
  publicState?: "AVAILABLE" | "NO_DATA";
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

type FetchError = Error & {
  status?: number;
  code?: string;
  publicState?: PublicFinanceiroState;
};

function resolveState(
  data: FinanceiroPublicData | undefined,
  error: FetchError | undefined
): PublicFinanceiroState {
  const dataState = String(data?.publicState || "").toUpperCase();
  if (dataState === "AVAILABLE") return "AVAILABLE";
  if (dataState === "NO_DATA") return "NO_DATA";

  const errorState = String(error?.publicState || "").toUpperCase();
  if (errorState === "SLUG_NOT_FOUND") return "SLUG_NOT_FOUND";
  if (errorState === "MODULE_DISABLED") return "MODULE_DISABLED";

  if (error?.status === 404 || String(error?.code || "").toUpperCase() === "RACHA_NOT_FOUND") {
    return "SLUG_NOT_FOUND";
  }
  if (
    error?.status === 403 ||
    String(error?.code || "").toUpperCase() === "FINANCEIRO_MODULE_DISABLED"
  ) {
    return "MODULE_DISABLED";
  }
  if (error) {
    return "UNAVAILABLE";
  }

  const lancamentosLength = Array.isArray(data?.lancamentos) ? data?.lancamentos.length : 0;
  return lancamentosLength > 0 ? "AVAILABLE" : "NO_DATA";
}

async function fetcher(url: string): Promise<FinanceiroPublicData> {
  const res = await fetch(url);
  const payload = await res.json().catch(() => null);
  const parsedRecord = payload && typeof payload === "object" ? (payload as any) : null;

  if (!res.ok) {
    const message =
      parsedRecord?.message ||
      parsedRecord?.error ||
      "Não foi possível carregar a prestação de contas.";
    const error = new Error(message) as FetchError;
    error.status = res.status;
    error.code = typeof parsedRecord?.code === "string" ? parsedRecord.code : undefined;
    error.publicState =
      typeof parsedRecord?.publicState === "string"
        ? (parsedRecord.publicState as PublicFinanceiroState)
        : undefined;
    throw error;
  }

  return (parsedRecord ?? {}) as FinanceiroPublicData;
}

/**
 * Busca dados financeiros publicos de um racha especifico.
 * @param slug string (slug do racha)
 */
export function useFinanceiroPublic(slug: string) {
  const slugValue = slug?.trim();
  const { data, error, mutate, isLoading } = useSWR<FinanceiroPublicData, FetchError>(
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
  const state = resolveState(data, error);

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
    state,
    tenant: data?.tenant ?? null,
    resumo,
    lancamentos,
    isLoading,
    isError: state === "UNAVAILABLE" ? error : null,
    isNotFound: state === "NO_DATA",
    isSlugNotFound: state === "SLUG_NOT_FOUND",
    isModuleDisabled: state === "MODULE_DISABLED",
    isUnavailable: state === "UNAVAILABLE",
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}

// Reexporta o tipo usado na pagina publica
export type { LancamentoFinanceiro };
