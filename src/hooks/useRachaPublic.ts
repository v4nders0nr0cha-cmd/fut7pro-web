// src/hooks/useRachaPublic.ts

import useSWR from "swr";
import type { Racha } from "@/types/racha";
import { validateSafe, rachaSchema } from "@/lib/validation";

async function fetcher(url: string): Promise<Racha> {
  const res = await fetch(url);

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ message: "Erro desconhecido" }));
    throw new Error(
      errorData.message || `HTTP ${res.status}: ${res.statusText}`,
    );
  }

  const data = await res.json();

  // Validar dados recebidos
  const validation = validateSafe(rachaSchema, data);
  if (!validation.success) {
    throw new Error(`Dados inválidos: ${validation.errors.join(", ")}`);
  }

  return validation.data;
}

/**
 * Busca os detalhes de um racha específico por slug ou ID (API pública).
 * @param identifier string (slug ou ID do racha)
 */
export function useRachaPublic(identifier: string) {
  const { data, error, mutate, isLoading } = useSWR(
    identifier ? `/api/public/rachas/${identifier}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 segundos
      errorRetryCount: 3,
      errorRetryInterval: 5000, // 5 segundos
    },
  );

  return {
    racha: data,
    isLoading,
    isError: error,
    error: error?.message,
    mutate,
  };
}
