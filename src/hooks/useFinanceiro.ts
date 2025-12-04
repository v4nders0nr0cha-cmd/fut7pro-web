"use client";

import useSWR from "swr";
import { useRacha } from "@/context/RachaContext";
import { financeiroApi } from "@/lib/api";
import { useApiState } from "./useApiState";
import type { LancamentoFinanceiro } from "@/types/financeiro";

const fetcher = async (url: string): Promise<LancamentoFinanceiro[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erro ao buscar dados financeiros");
  }
  return response.json();
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
      const response = await financeiroApi.create({
        ...lancamento,
        rachaId,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      await mutate();
      return response.data;
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
