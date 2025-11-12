"use client";

import useSWR from "swr";
import { useRacha } from "@/context/RachaContext";
import { financeiroApi } from "@/lib/api";
import { useApiState } from "./useApiState";
import type {
  LancamentoFinanceiro,
  CategoriaFinanceiro,
  MovimentoFinanceiro,
} from "@/types/financeiro";

function normalizeLancamento(raw: any): LancamentoFinanceiro {
  const tipoRaw = typeof raw?.tipo === "string" ? raw.tipo.toLowerCase() : "";
  const movimentoRaw =
    typeof raw?.movimento === "string" ? raw.movimento.toLowerCase() : undefined;

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
  const categoria = (typeof categoriaSource === "string"
    ? categoriaSource
    : "outros") as CategoriaFinanceiro | string;

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
        : raw?.adminNome ?? raw?.adminEmail ?? undefined,
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

export function useFinanceiro() {
  const { rachaId } = useRacha();
  const apiState = useApiState();

  const { data, error, isLoading, mutate } = useSWR<LancamentoFinanceiro[]>(
    rachaId ? `/api/admin/financeiro?rachaId=${rachaId}` : null,
    fetcher,
    {
      onError: (err) => {
        if (process.env.NODE_ENV === "development") {
          console.log("Erro ao carregar dados financeiros:", err);
        }
      },
    }
  );

  const addLancamento = async (lancamento: Partial<LancamentoFinanceiro>) => {
    if (!rachaId) return null;

    return apiState.handleAsync(async () => {
      const payload = {
        ...lancamento,
        rachaId,
        valor:
          typeof lancamento.valor === "number" && Number.isFinite(lancamento.valor)
            ? Math.abs(lancamento.valor)
            : lancamento.valor,
      };

      const response = await financeiroApi.create(payload);

      if (response.error) {
        throw new Error(response.error);
      }

      await mutate();
      return response.data ? normalizeLancamento(response.data) : null;
    });
  };

  const getRelatorios = async () => {
    if (!rachaId) return null;

    return apiState.handleAsync(async () => {
      const response = await financeiroApi.getRelatorios(rachaId);

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
    });
  };

  const getLancamentoById = (id: string) => {
    return data?.find((l) => l.id === id);
  };

  const getLancamentosPorTipo = (tipo: string) => {
    return data?.filter((l) => l.tipo === tipo) || [];
  };

  const getLancamentosPorPeriodo = (dataInicio: string, dataFim: string) => {
    return (
      data?.filter((l) => {
        const dataLancamento = new Date(l.data);
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        return dataLancamento >= inicio && dataLancamento <= fim;
      }) || []
    );
  };

  return {
    lancamentos: data || [],
    isLoading: isLoading || apiState.isLoading,
    isError: !!error || apiState.isError,
    error: apiState.error,
    isSuccess: apiState.isSuccess,
    mutate,
    addLancamento,
    getRelatorios,
    getLancamentoById,
    getLancamentosPorTipo,
    getLancamentosPorPeriodo,
    reset: apiState.reset,
  };
}

