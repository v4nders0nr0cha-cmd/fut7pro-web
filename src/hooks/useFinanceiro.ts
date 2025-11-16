"use client";

import useSWR from "swr";
import { useMemo } from "react";
import { useRacha } from "@/context/RachaContext";
import { useAuth } from "@/hooks/useAuth";
import { useApiState } from "./useApiState";
import type {
  LancamentoFinanceiro,
  CategoriaFinanceiro,
  MovimentoFinanceiro,
} from "@/types/financeiro";

function normalizeLancamento(raw: any): LancamentoFinanceiro {
  const tipoRaw = typeof raw?.tipo === "string" ? raw.tipo.toLowerCase() : "";
  const movimentoRaw = typeof raw?.movimento === "string" ? raw.movimento.toLowerCase() : undefined;

  let tipo: MovimentoFinanceiro = "entrada";
  if (movimentoRaw === "saida" || tipoRaw === "saida") {
    tipo = "saida";
  } else if (movimentoRaw === "entrada" || tipoRaw === "entrada") {
    tipo = "entrada";
  } else if (tipoRaw.startsWith("despesa") || tipoRaw === "sistema" || tipoRaw === "multa") {
    tipo = "saida";
  }

  const categoriaSource =
    raw?.categoria ??
    raw?.category ??
    (tipoRaw && tipoRaw !== "entrada" && tipoRaw !== "saida" ? raw?.tipo : undefined) ??
    "outros";
  const categoria = (typeof categoriaSource === "string" ? categoriaSource : "outros") as
    | CategoriaFinanceiro
    | string;

  const valorRaw =
    raw?.valor ?? raw?.value ?? raw?.amount ?? (typeof raw?.total === "number" ? raw.total : 0);
  const valorNumber = Number(valorRaw);
  const valor = Number.isFinite(valorNumber) ? Math.abs(valorNumber) : 0;

  const comprovante =
    typeof raw?.comprovanteUrl === "string"
      ? raw.comprovanteUrl
      : typeof raw?.comprovante_url === "string"
        ? raw.comprovante_url
        : null;

  return {
    id: raw?.id ? String(raw.id) : raw?.uuid ? String(raw.uuid) : "",
    rachaId: raw?.rachaId ?? raw?.racha_id ?? undefined,
    adminId: raw?.adminId ?? raw?.admin_id ?? undefined,
    tipo,
    categoria,
    descricao:
      typeof raw?.descricao === "string"
        ? raw.descricao
        : typeof raw?.description === "string"
          ? raw.description
          : undefined,
    valor,
    data:
      typeof raw?.data === "string"
        ? raw.data
        : typeof raw?.date === "string"
          ? raw.date
          : new Date().toISOString(),
    responsavel:
      typeof raw?.responsavel === "string"
        ? raw.responsavel
        : (raw?.adminNome ?? raw?.adminEmail ?? undefined),
    adminNome: raw?.adminNome ?? undefined,
    adminEmail: raw?.adminEmail ?? undefined,
    comprovanteUrl: comprovante,
    criadoEm: raw?.criadoEm ?? raw?.createdAt ?? undefined,
    atualizadoEm: raw?.atualizadoEm ?? raw?.updatedAt ?? undefined,
  };
}

const fetcher = async (url: string): Promise<LancamentoFinanceiro[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erro ao buscar dados financeiros");
  }
  const payload = await response.json();
  if (!Array.isArray(payload)) {
    return [];
  }
  return payload.map(normalizeLancamento);
};

function buildQuery(tenantSlug: string | null, rachaId: string | null) {
  if (tenantSlug) {
    return `slug=${encodeURIComponent(tenantSlug)}`;
  }
  if (rachaId) {
    return `rachaId=${encodeURIComponent(rachaId)}`;
  }
  return null;
}

type LancamentoPayload = Partial<LancamentoFinanceiro> & {
  tipo?: MovimentoFinanceiro;
  valor?: number;
  tenantSlug?: string | null;
};

export function useFinanceiro() {
  const { rachaId } = useRacha();
  const { user } = useAuth();
  const apiState = useApiState();

  const tenantSlug = user?.tenantSlug ?? null;
  const fallbackRachaId = !tenantSlug && rachaId ? rachaId : null;

  const query = useMemo(
    () => buildQuery(tenantSlug, fallbackRachaId),
    [tenantSlug, fallbackRachaId]
  );
  const listKey = query ? `/api/admin/financeiro?${query}` : null;

  const { data, error, isLoading, mutate } = useSWR<LancamentoFinanceiro[]>(listKey, fetcher, {
    onError: (err) => {
      if (process.env.NODE_ENV === "development") {
        console.warn("Erro ao carregar dados financeiros:", err);
      }
    },
  });

  const ensureQuery = () => {
    if (!query) {
      throw new Error("Racha não identificado para operações financeiras.");
    }
    return query;
  };

  const toPayload = (input: LancamentoPayload) => {
    if (!input) return {};
    const payload = { ...input };
    if (typeof payload.valor === "number" && Number.isFinite(payload.valor)) {
      payload.valor = Math.abs(payload.valor);
    }
    payload.tipo = payload.tipo ?? "entrada";
    payload.tenantSlug = tenantSlug ?? undefined;
    return payload;
  };

  const addLancamento = async (lancamento: LancamentoPayload) => {
    try {
      const qs = ensureQuery();
      return await apiState.handleAsync(async () => {
        const response = await fetch(`/api/admin/financeiro?${qs}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toPayload(lancamento)),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error ?? "Erro ao criar lançamento");
        }

        const json = await response.json().catch(() => null);
        await mutate();
        return json ? normalizeLancamento(json) : null;
      });
    } catch (error) {
      throw error instanceof Error ? error : new Error("Erro ao criar lançamento");
    }
  };

  const updateLancamento = async (id: string, lancamento: LancamentoPayload) => {
    try {
      const qs = ensureQuery();
      return await apiState.handleAsync(async () => {
        const response = await fetch(`/api/admin/financeiro/${id}?${qs}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toPayload(lancamento)),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error ?? "Erro ao atualizar lançamento");
        }

        const json = await response.json().catch(() => null);
        await mutate();
        return json ? normalizeLancamento(json) : null;
      });
    } catch (error) {
      throw error instanceof Error ? error : new Error("Erro ao atualizar lançamento");
    }
  };

  const deleteLancamento = async (id: string) => {
    try {
      const qs = ensureQuery();
      return await apiState.handleAsync(async () => {
        const response = await fetch(`/api/admin/financeiro/${id}?${qs}`, {
          method: "DELETE",
          headers: { Accept: "application/json" },
        });

        if (!response.ok && response.status !== 204) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error ?? "Erro ao excluir lançamento");
        }

        await mutate();
        return true;
      });
    } catch (error) {
      throw error instanceof Error ? error : new Error("Erro ao excluir lançamento");
    }
  };

  const getRelatorios = async () => {
    if (!query) return null;

    return apiState.handleAsync(async () => {
      const response = await fetch(`/api/admin/financeiro/relatorios?${query}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? "Erro ao consultar relatórios financeiros");
      }

      return response.json().catch(() => null);
    });
  };

  const getLancamentoById = (id: string) => data?.find((l) => l.id === id);

  const getLancamentosPorTipo = (tipo: MovimentoFinanceiro | string) =>
    data?.filter((l) => l.tipo === tipo) ?? [];

  const getLancamentosPorPeriodo = (dataInicio: string, dataFim: string) => {
    if (!data) return [];
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    return data.filter((l) => {
      const dataLancamento = new Date(l.data);
      return dataLancamento >= inicio && dataLancamento <= fim;
    });
  };

  return {
    lancamentos: data || [],
    isLoading: (isLoading ?? false) || apiState.isLoading,
    isError: !!error || apiState.isError,
    error: error instanceof Error ? error.message : apiState.error,
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
