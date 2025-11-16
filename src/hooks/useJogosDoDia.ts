"use client";

import { useMemo } from "react";
import { usePublicMatches } from "@/hooks/usePublicMatches";
import { rachaConfig } from "@/config/racha.config";
import { mapMatchToPartida } from "./usePartidas";
import type { Partida } from "@/types/partida";

type UseJogosDoDiaOptions = {
  slug?: string | null;
  limit?: number;
};

export function useJogosDoDia(options?: UseJogosDoDiaOptions) {
  const tenantSlug = options?.slug ?? rachaConfig.slug;
  const limit = options?.limit ?? 6;

  const { matches, isLoading, isError, error, mutate } = usePublicMatches({
    slug: tenantSlug,
    params: { scope: "today", limit },
  });

  const jogos: Partida[] = useMemo(() => matches.map(mapMatchToPartida), [matches]);

  return {
    jogos,
    isLoading,
    isError,
    error,
    mutate,
  };
}
