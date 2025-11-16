"use client";

import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { jogadoresApi } from "@/lib/api";
import { useApiState } from "./useApiState";
import type { Athlete } from "@/types/jogador";

type UseJogadoresKey = readonly ["admin/jogadores", string | null | undefined];

async function fetchJogadores([, slug]: UseJogadoresKey): Promise<Athlete[]> {
  const params = slug ? { slug } : undefined;
  const response = await jogadoresApi.list(params);

  const athletes = Array.isArray(response) ? response : [];

  return athletes.map((athlete) => {
    const isMember = Boolean(athlete.isMember);
    return {
      ...athlete,
      isMember,
      mensalista: isMember,
    };
  });
}

export function useJogadores(tenantSlug: string | null | undefined) {
  const apiState = useApiState();

  const swrKey = useMemo<UseJogadoresKey | null>(
    () => (tenantSlug !== undefined ? ["admin/jogadores", tenantSlug] : null),
    [tenantSlug]
  );

  const { data, error, isLoading, isValidating, mutate } = useSWR<Athlete[]>(
    swrKey,
    fetchJogadores,
    {
      revalidateOnFocus: true,
      keepPreviousData: true,
    }
  );

  const createJogador = useCallback(
    async (payload: Partial<Athlete>) => {
      return apiState.handleAsync(async () => {
        const created = await jogadoresApi.create(payload);
        await mutate();
        return created ?? null;
      });
    },
    [apiState, mutate]
  );

  const updateJogador = useCallback(
    async (id: string, payload: Partial<Athlete>) => {
      return apiState.handleAsync(async () => {
        const updated = await jogadoresApi.update(id, payload);
        await mutate();
        return updated ?? null;
      });
    },
    [apiState, mutate]
  );

  const deleteJogador = useCallback(
    async (id: string) => {
      await apiState.handleAsync(async () => {
        await jogadoresApi.delete(id);
        await mutate();
        return null;
      });
    },
    [apiState, mutate]
  );

  return {
    jogadores: data ?? [],
    isLoading: (isLoading ?? false) || apiState.isLoading,
    isValidating: isValidating ?? false,
    isError: Boolean(error) || apiState.isError,
    error: error instanceof Error ? error.message : apiState.error,
    isSuccess: apiState.isSuccess && !error,
    createJogador,
    updateJogador,
    deleteJogador,
    mutate,
    reset: apiState.reset,
  };
}
