"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { useMe } from "@/hooks/useMe";
import { useApiState } from "./useApiState";
import type { LancamentoFinanceiro } from "@/types/financeiro";

type FinanceiroApiItem = {
  id?: string;
  date?: string;
  data?: string;
  type?: string;
  tipo?: string;
  value?: number;
  valor?: number;
  description?: string;
  descricao?: string;
  category?: string;
  categoria?: string;
  responsavel?: string;
  adminNome?: string;
  tenantId?: string;
  comprovanteUrl?: string;
  observacoes?: string;
  sourceType?: string;
  sourceId?: string;
  athleteId?: string;
  auto?: boolean;
  competencia?: string;
  competenciaAno?: number;
  competenciaMes?: number;
  createdAt?: string;
  updatedAt?: string;
  canceledAt?: string | null;
  canceledById?: string | null;
  cancelReason?: string | null;
  createdById?: string | null;
};

class FinanceiroFetchError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "FinanceiroFetchError";
    this.status = status;
  }
}

function sanitizeFinanceiroUserMessage(message: string, fallback: string) {
  const blockedTerms = ["backend", "forbidden", "payload", "request", "internal server error"];
  const normalized = message.toLowerCase();
  if (blockedTerms.some((term) => normalized.includes(term))) {
    return fallback;
  }
  return message;
}

async function readFinanceiroErrorMessage(response: Response): Promise<string> {
  const fallbackByStatus: Record<number, string> = {
    401: "Sua sessão expirou. Faça login novamente para continuar.",
    403: "Você não tem permissão para visualizar os lançamentos financeiros deste racha.",
    429: "Muitas tentativas em pouco tempo. Aguarde alguns instantes e tente novamente.",
  };

  const fallback =
    fallbackByStatus[response.status] ||
    "Não foi possível carregar os lançamentos financeiros agora. Tente novamente em instantes.";

  const text = await response.text();
  if (!text) return fallback;

  try {
    const parsed = JSON.parse(text) as { message?: unknown; error?: unknown };
    const message =
      typeof parsed.message === "string"
        ? parsed.message
        : typeof parsed.error === "string"
          ? parsed.error
          : "";
    const trimmed = message.trim();
    if (!trimmed) return fallback;
    return sanitizeFinanceiroUserMessage(trimmed, fallback);
  } catch {
    return fallback;
  }
}

const fetcher = async (url: string): Promise<FinanceiroApiItem[]> => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const message = await readFinanceiroErrorMessage(response);
    throw new FinanceiroFetchError(message, response.status);
  }
  return response.json();
};

const normalizeDateValue = (value?: string) => {
  if (!value) return "";
  if (value.includes("T")) return value.slice(0, 10);
  return value;
};

const normalizeLancamento = (item: FinanceiroApiItem): LancamentoFinanceiro => {
  const rawType = `${item.tipo ?? item.type ?? ""}`.toLowerCase();
  const rawValue = Number(item.valor ?? item.value ?? 0);
  const isSaida = rawType.includes("saida") || rawType.includes("desp") || rawValue < 0;
  const normalizedValue = isSaida ? -Math.abs(rawValue) : Math.abs(rawValue);

  return {
    id: item.id || "",
    data: normalizeDateValue(item.data ?? item.date),
    tipo: isSaida ? "saida" : "entrada",
    descricao: item.descricao ?? item.description ?? "",
    categoria: item.categoria ?? item.category ?? "",
    valor: normalizedValue,
    comprovanteUrl: item.comprovanteUrl,
    observacoes: item.observacoes,
    responsavel: item.responsavel ?? item.adminNome ?? "",
    tenantId: item.tenantId,
    sourceType: item.sourceType,
    sourceId: item.sourceId,
    athleteId: item.athleteId,
    auto: typeof item.auto === "boolean" ? item.auto : undefined,
    competencia: item.competencia,
    competenciaAno: item.competenciaAno,
    competenciaMes: item.competenciaMes,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    canceledAt: item.canceledAt,
    canceledById: item.canceledById,
    cancelReason: item.cancelReason,
    createdById: item.createdById,
  };
};

const normalizePayloadDate = (value?: string) => {
  if (!value) return undefined;
  if (value.includes("T")) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
};

type FinanceiroInput = Partial<LancamentoFinanceiro> & {
  type?: string;
  date?: string;
  description?: string;
  category?: string;
  value?: number;
  comprovanteUrl?: string;
  observacoes?: string;
};

const buildFinanceiroPayload = (input: FinanceiroInput) => {
  const rawType = `${input.tipo ?? input.type ?? ""}`.toLowerCase();
  const rawValue = Number(input.valor ?? input.value ?? 0);
  const isSaida = rawType.includes("saida") || rawType.includes("desp") || rawValue < 0;

  return {
    date: normalizePayloadDate(input.data ?? input.date),
    type: isSaida ? "SAIDA" : "ENTRADA",
    value: Math.abs(rawValue),
    description: input.descricao ?? input.description ?? "",
    category: input.categoria ?? input.category ?? "",
    comprovanteUrl: input.comprovanteUrl ?? undefined,
    observacoes: input.observacoes ?? undefined,
  };
};

export function useFinanceiro() {
  const { me } = useMe();
  const apiState = useApiState();

  const tenantId = me?.tenant?.tenantId;

  const { data, error, isLoading, mutate } = useSWR<FinanceiroApiItem[], FinanceiroFetchError>(
    tenantId ? "/api/admin/financeiro" : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 8000,
      shouldRetryOnError: (fetchError) => {
        if (!fetchError) return false;
        if ([401, 403, 404, 429].includes(fetchError.status)) return false;
        return fetchError.status >= 500;
      },
      errorRetryCount: 1,
      errorRetryInterval: 8000,
      onError: (err) => {
        if (process.env.NODE_ENV === "development") {
          console.error("Erro ao carregar dados financeiros:", err);
        }
      },
    }
  );

  const lancamentos = useMemo(() => {
    const origem = Array.isArray(data) ? data : [];
    const normalizados = origem.map(normalizeLancamento);
    if (!tenantId) return normalizados;
    return normalizados.filter((item) => !item.tenantId || item.tenantId === tenantId);
  }, [data, tenantId]);

  const addLancamento = async (lancamento: Partial<LancamentoFinanceiro>) => {
    if (!tenantId) return null;

    return apiState.handleAsync(async () => {
      const payload = buildFinanceiroPayload(lancamento);
      const response = await fetch("/api/admin/financeiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await readFinanceiroErrorMessage(response);
        throw new Error(message || "Não foi possível salvar o lançamento financeiro.");
      }

      await Promise.resolve(mutate()).catch(() => undefined);
      return response.json().catch(() => null);
    });
  };

  const updateLancamento = async (id: string, lancamento: Partial<LancamentoFinanceiro>) => {
    if (!tenantId || !id) return null;

    return apiState.handleAsync(async () => {
      const payload = buildFinanceiroPayload(lancamento);
      const response = await fetch(`/api/admin/financeiro/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await readFinanceiroErrorMessage(response);
        throw new Error(message || "Não foi possível atualizar o lançamento financeiro.");
      }

      await Promise.resolve(mutate()).catch(() => undefined);
      return response.json().catch(() => null);
    });
  };

  const deleteLancamento = async (id: string) => {
    if (!id) return null;

    return apiState.handleAsync(async () => {
      const response = await fetch(`/api/admin/financeiro/${id}`, { method: "DELETE" });

      if (!response.ok) {
        const message = await readFinanceiroErrorMessage(response);
        throw new Error(message || "Não foi possível remover o lançamento financeiro.");
      }

      await Promise.resolve(mutate()).catch(() => undefined);
      return response.json().catch(() => null);
    });
  };

  const getRelatorios = async () => {
    const totalReceitas = lancamentos
      .filter((l) => (l.valor ?? 0) > 0)
      .reduce((acc, l) => acc + (l.valor ?? 0), 0);
    const totalDespesas = lancamentos
      .filter((l) => (l.valor ?? 0) < 0)
      .reduce((acc, l) => acc + (l.valor ?? 0), 0);
    const saldoAtual = totalReceitas + totalDespesas;

    return {
      totalReceitas,
      totalDespesas,
      saldoAtual,
    };
  };

  const getLancamentoById = (id: string) => {
    return lancamentos.find((l) => l.id === id);
  };

  const getLancamentosPorTipo = (tipo: string) => {
    return lancamentos.filter((l) => l.tipo === tipo);
  };

  const getLancamentosPorPeriodo = (dataInicio: string, dataFim: string) => {
    return lancamentos.filter((l) => {
      const dataLancamento = new Date(l.data);
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      return dataLancamento >= inicio && dataLancamento <= fim;
    });
  };

  return {
    lancamentos,
    isLoading: isLoading || apiState.isLoading,
    isError: !!error || apiState.isError,
    error: apiState.error || (error instanceof Error ? error.message : null),
    isSuccess: apiState.isSuccess,
    mutate,
    addLancamento,
    updateLancamento,
    deleteLancamento,
    getRelatorios,
    getLancamentoById,
    getLancamentosPorTipo,
    getLancamentosPorPeriodo,
    reset: apiState.reset,
  };
}
