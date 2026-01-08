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
};

const fetcher = async (url: string): Promise<FinanceiroApiItem[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erro ao buscar dados financeiros");
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

const buildFinanceiroPayload = (input: FinanceiroInput, tenantId: string) => {
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
    tenantId,
  };
};

export function useFinanceiro() {
  const { me } = useMe();
  const apiState = useApiState();

  const tenantId = me?.tenant?.tenantId;
  const query = tenantId ? `?tenantId=${tenantId}` : "";

  const { data, error, isLoading, mutate } = useSWR<FinanceiroApiItem[]>(
    tenantId ? `/api/admin/financeiro${query}` : null,
    fetcher,
    {
      onError: (err) => {
        if (process.env.NODE_ENV === "development") {
          console.log("Erro ao carregar dados financeiros:", err);
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
      const payload = buildFinanceiroPayload(lancamento, tenantId);
      const response = await fetch("/api/admin/financeiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || "Erro ao salvar lancamento financeiro");
      }

      await mutate();
      return response.json().catch(() => null);
    });
  };

  const updateLancamento = async (id: string, lancamento: Partial<LancamentoFinanceiro>) => {
    if (!tenantId || !id) return null;

    return apiState.handleAsync(async () => {
      const payload = buildFinanceiroPayload(lancamento, tenantId);
      const response = await fetch(`/api/admin/financeiro/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || "Erro ao atualizar lancamento financeiro");
      }

      await mutate();
      return response.json().catch(() => null);
    });
  };

  const deleteLancamento = async (id: string) => {
    if (!id) return null;

    return apiState.handleAsync(async () => {
      const response = await fetch(`/api/admin/financeiro/${id}`, { method: "DELETE" });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || "Erro ao remover lancamento financeiro");
      }

      await mutate();
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
    error: apiState.error,
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
