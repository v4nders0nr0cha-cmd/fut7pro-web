// src/hooks/useRachaPublic.ts

import useSWR from "swr";
import type { Racha } from "@/types/racha";
import { validateSafe, rachaSchema } from "@/lib/validation";

async function fetcher(url: string): Promise<Racha> {
  const res = await fetch(url);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Erro desconhecido" }));
    throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();

  const validation = validateSafe(rachaSchema, data);
  if (validation.success === false) {
    const { errors } = validation;
    throw new Error(`Dados invalidos: ${errors.join(", ")}`);
  }

  const normalized: Racha = {
    ...validation.data,
    admins: Array.isArray(validation.data.admins)
      ? (validation.data.admins as Racha["admins"])
      : [],
    jogadores: Array.isArray(validation.data.jogadores)
      ? (validation.data.jogadores as Racha["jogadores"])
      : [],
  } as Racha;

  return normalized;
}

/**
 * Busca os detalhes de um racha por slug ou ID (API publica).
 */
export function useRachaPublic(identifier: string) {
  const { data, error, mutate, isLoading } = useSWR(
    identifier ? `/api/public/rachas/${identifier}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  return {
    racha: data,
    isLoading,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}
