"use client";

import { useMemo } from "react";
import useSWR from "swr";
import type { ProximoRachaItem } from "@/types/agenda";

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Erro ao buscar proximos rachas");
  }
  return response.json();
};

function normalizeItems(data: unknown): ProximoRachaItem[] {
  if (Array.isArray(data)) return data as ProximoRachaItem[];
  if (data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items)) {
    return (data as { items: ProximoRachaItem[] }).items;
  }
  return [];
}

type UseProximosRachasOptions = {
  limit?: number;
  enabled?: boolean;
};

export function useProximosRachas(options: UseProximosRachasOptions = {}) {
  const limit = options.limit ?? 5;
  const enabled = options.enabled ?? true;
  const key = enabled ? `/api/admin/rachas/agenda/proximos?limit=${limit}` : null;

  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
  });

  const items = useMemo(() => normalizeItems(data), [data]);

  return {
    items,
    isLoading,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}
