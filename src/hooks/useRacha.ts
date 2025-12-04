// src/hooks/useRacha.ts

import useSWR from "swr";
import type { Racha } from "@/types/racha";
import { validateSafe, rachaSchema } from "@/lib/validation";

async function fetcher(url: string): Promise<Racha> {
  const res = await fetch(url);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();

  // Validar dados recebidos
  const validation = validateSafe(rachaSchema, data) as
    | { success: true; data: Racha }
    | { success: false; errors: string[] };
  if (!validation.success) {
    const errors = (validation as { errors: string[] }).errors;
    throw new Error(`Dados inválidos: ${errors.join(", ")}`);
  }

  return validation.data;
}

/**
 * Busca os detalhes de um racha específico.
 * @param rachaId string (id ou slug)
 */
export function useRacha(rachaId: string) {
  const { data, error, mutate, isLoading } = useSWR(
    rachaId ? `/api/rachas/${rachaId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 segundos
      errorRetryCount: 3,
      errorRetryInterval: 5000, // 5 segundos
    }
  );

  return {
    racha: data,
    isLoading,
    isError: error,
    error: error?.message,
    mutate,
  };
}
