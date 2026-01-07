"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { useApiState } from "./useApiState";
import type { RachaAgendaItem } from "@/types/agenda";

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Erro ao buscar agenda do racha");
  }
  return response.json();
};

function normalizeItems(data: unknown): RachaAgendaItem[] {
  if (Array.isArray(data)) return data as RachaAgendaItem[];
  if (data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items)) {
    return (data as { items: RachaAgendaItem[] }).items;
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

type CreateAgendaPayload = {
  weekday: number;
  time: string;
};

type UseRachaAgendaOptions = {
  enabled?: boolean;
};

export function useRachaAgenda(options: UseRachaAgendaOptions = {}) {
  const enabled = options.enabled ?? true;
  const apiState = useApiState();

  const { data, error, isLoading, mutate } = useSWR(
    enabled ? "/api/admin/rachas/agenda" : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const items = useMemo(() => normalizeItems(data), [data]);

  const createAgenda = async (payload: CreateAgendaPayload) =>
    apiState.handleAsync(async () => {
      const response = await fetch("/api/admin/rachas/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await readErrorMessage(response, "Erro ao adicionar horario");
        throw new Error(message);
      }

      const body = await response.json();
      await mutate();
      return body;
    });

  const removeAgenda = async (id: string) =>
    apiState.handleAsync(async () => {
      const response = await fetch(`/api/admin/rachas/agenda/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const message = await readErrorMessage(response, "Erro ao remover horario");
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
    isSuccess: apiState.isSuccess,
    createAgenda,
    removeAgenda,
    mutate,
  };
}
