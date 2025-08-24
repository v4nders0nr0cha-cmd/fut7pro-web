// src/hooks/useRachas.ts

import useSWR from "swr";
import type { Racha } from "@/types/racha";

async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Erro ao buscar rachas");
  return res.json();
}

/**
 * Busca todos os rachas cadastrados.
 */
export function useRachas() {
  const { data, error, mutate, isLoading } = useSWR<Racha[]>(
    "/api/admin/rachas",
    fetcher,
  );

  return {
    rachas: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
