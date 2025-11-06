"use client";

import useSWR from "swr";
import { useMemo } from "react";
import type { Atleta } from "@/types/atletas";
import { usePublicTenantSlug } from "./usePublicTenantSlug";
import { normalizeAtleta } from "@/utils/normalize-atleta";

type PublicAthleteResponse = {
  slug?: string;
  athleteSlug?: string;
  result?: unknown;
  error?: string;
};

async function fetchPublicAthlete(url: string) {
  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const message =
      (payload && typeof payload === "object" && "error" in payload && payload.error) ||
      `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(String(message));
  }

  const payload: PublicAthleteResponse | unknown = await res.json();

  const raw =
    (payload && typeof payload === "object" && "result" in payload ? payload.result : payload) ??
    null;

  const normalized = normalizeAtleta(raw);
  if (!normalized) {
    throw new Error("Dados do atleta inválidos ou ausentes");
  }

  return {
    athlete: normalized,
    raw: payload,
  };
}

type UsePublicAthleteOptions = {
  tenantSlug?: string;
};

export function usePublicAthlete(
  athleteSlug: string | null | undefined,
  options?: UsePublicAthleteOptions
) {
  const resolvedSlug = usePublicTenantSlug();
  const tenantSlug = options?.tenantSlug ?? resolvedSlug;

  const key = useMemo(() => {
    if (!athleteSlug || !tenantSlug) {
      return null;
    }
    const params = new URLSearchParams();
    params.set("slug", tenantSlug);
    return `/api/public/athletes/${encodeURIComponent(athleteSlug)}?${params.toString()}`;
  }, [athleteSlug, tenantSlug]);

  const { data, error, isLoading, isValidating, mutate } = useSWR(key, fetchPublicAthlete, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  return {
    athlete: data?.athlete ?? null,
    isLoading: isLoading ?? false,
    isValidating: isValidating ?? false,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}
