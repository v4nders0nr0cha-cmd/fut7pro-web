"use client";

import { useCallback } from "react";
import useSWR from "swr";
import type { AvaliacaoEstrela } from "@/types/sorteio";

async function fetchAvaliacoes(url: string): Promise<AvaliacaoEstrela[]> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const message = await response.text().catch(() => "Erro ao carregar estrelas");
    throw new Error(message);
  }
  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
}

export function useEstrelas(tenantSlug: string | null | undefined) {
  const endpoint =
    tenantSlug && tenantSlug.length > 0
      ? `/api/estrelas?tenantSlug=${encodeURIComponent(tenantSlug)}`
      : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<AvaliacaoEstrela[]>(
    endpoint,
    fetchAvaliacoes,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  const salvarEstrela = useCallback(
    async (jogadorId: string, estrelas: number) => {
      if (!tenantSlug || tenantSlug.length === 0) {
        throw new Error("Tenant n�o informado");
      }

      const response = await fetch("/api/estrelas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantSlug,
          jogadorId,
          estrelas,
        }),
      });

      if (!response.ok) {
        const message = await response.text().catch(() => "Falha ao salvar estrelas");
        throw new Error(message || "Falha ao salvar estrelas");
      }

      await mutate();
      return response.json();
    },
    [mutate, tenantSlug]
  );

  return {
    avaliacoes: data ?? [],
    isLoading: Boolean(isLoading || isValidating),
    error: error instanceof Error ? error.message : null,
    salvarEstrela,
    mutate,
  };
}
