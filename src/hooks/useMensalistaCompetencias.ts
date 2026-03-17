"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { useApiState } from "./useApiState";

export type MensalistaCompetenciaItem = {
  athleteId: string;
  year: number;
  month: number;
  isPaid: boolean;
  paidAt?: string | null;
  agendaIds: string[];
};

type UpdateCompetenciaPayload = {
  agendaIds?: string[];
  isPaid?: boolean;
};

type RegisterPagamentoPayload = {
  value: number;
  athleteName?: string;
  agendaResumo?: string[];
};

type CancelPagamentoPayload = {
  reason?: string;
};

type RegisterPagamentoLotePayload = {
  items: Array<{
    athleteId: string;
    value: number;
    athleteName?: string;
    agendaResumo?: string[];
  }>;
};

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Erro ao buscar competencias de mensalistas");
  }
  return response.json();
};

function normalizeItems(data: unknown): MensalistaCompetenciaItem[] {
  if (Array.isArray(data)) return data as MensalistaCompetenciaItem[];
  if (data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items)) {
    return (data as { items: MensalistaCompetenciaItem[] }).items;
  }
  return [];
}

async function readErrorMessage(response: Response, fallback: string) {
  const text = await response.text();
  if (!text) return fallback;
  try {
    const data = JSON.parse(text) as { error?: string; message?: string };
    return data.error || data.message || fallback;
  } catch {
    return text;
  }
}

export function useMensalistaCompetencias(year: number, month: number, enabled = true) {
  const apiState = useApiState();
  const key =
    enabled && year > 0 && month > 0
      ? `/api/admin/financeiro/mensalistas/competencias?year=${year}&month=${month}`
      : null;

  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
  });

  const items = useMemo(() => normalizeItems(data), [data]);

  const updateCompetencia = async (athleteId: string, payload: UpdateCompetenciaPayload) =>
    apiState.handleAsync(async () => {
      const response = await fetch(
        `/api/admin/financeiro/mensalistas/competencias/${encodeURIComponent(athleteId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year,
            month,
            ...payload,
          }),
        }
      );

      if (!response.ok) {
        const message = await readErrorMessage(
          response,
          "Erro ao atualizar competencia do mensalista"
        );
        throw new Error(message);
      }

      const body = await response.json();
      await mutate().catch(() => undefined);
      return body;
    });

  const registerPagamento = async (athleteId: string, payload: RegisterPagamentoPayload) =>
    apiState.handleAsync(async () => {
      const response = await fetch(
        `/api/admin/financeiro/mensalistas/pagamentos/${encodeURIComponent(athleteId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year,
            month,
            ...payload,
          }),
        }
      );

      if (!response.ok) {
        const message = await readErrorMessage(response, "Erro ao registrar pagamento mensalista");
        throw new Error(message);
      }

      const body = await response.json();
      await mutate().catch(() => undefined);
      return body;
    });

  const registerPagamentoLote = async (payload: RegisterPagamentoLotePayload) =>
    apiState.handleAsync(async () => {
      const response = await fetch("/api/admin/financeiro/mensalistas/pagamentos/lote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          month,
          ...payload,
        }),
      });

      if (!response.ok) {
        const message = await readErrorMessage(
          response,
          "Erro ao registrar pagamentos em lote de mensalistas"
        );
        throw new Error(message);
      }

      const body = await response.json();
      await mutate().catch(() => undefined);
      return body;
    });

  const cancelPagamento = async (athleteId: string, payload?: CancelPagamentoPayload) =>
    apiState.handleAsync(async () => {
      const response = await fetch(
        `/api/admin/financeiro/mensalistas/pagamentos/${encodeURIComponent(athleteId)}/cancelar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year,
            month,
            reason: payload?.reason,
          }),
        }
      );

      if (!response.ok) {
        const message = await readErrorMessage(response, "Erro ao cancelar pagamento mensalista");
        throw new Error(message);
      }

      const body = await response.json();
      await mutate().catch(() => undefined);
      return body;
    });

  const errorMessage = apiState.error || (error instanceof Error ? error.message : null);

  return {
    items,
    isLoading: isLoading || apiState.isLoading,
    isError: Boolean(error) || apiState.isError,
    error: errorMessage,
    updateCompetencia,
    registerPagamento,
    registerPagamentoLote,
    cancelPagamento,
    mutate,
  };
}
