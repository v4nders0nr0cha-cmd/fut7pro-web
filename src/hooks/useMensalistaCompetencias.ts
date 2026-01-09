"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { useApiState } from "./useApiState";

export type MensalistaCompetenciaItem = {
  athleteId: string;
  year: number;
  month: number;
  isPaid: boolean;
  agendaIds: string[];
};

type UpdateCompetenciaPayload = {
  agendaIds?: string[];
  isPaid?: boolean;
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
      await mutate();
      return body;
    });

  const errorMessage = apiState.error || (error instanceof Error ? error.message : null);

  return {
    items,
    isLoading: isLoading || apiState.isLoading,
    isError: Boolean(error) || apiState.isError,
    error: errorMessage,
    updateCompetencia,
    mutate,
  };
}
