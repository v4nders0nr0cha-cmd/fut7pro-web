"use client";

import useSWR from "swr";
import type { PublicAthleteResponse } from "@/types/public-athlete";

const fetcher = async (url: string): Promise<PublicAthleteResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(body || "Falha ao carregar atleta") as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.json();
};

export function usePublicAthlete(options: {
  tenantSlug?: string;
  athleteSlug?: string;
  enabled?: boolean;
}) {
  const enabled = options.enabled ?? true;
  const tenantSlug = options.tenantSlug?.trim();
  const athleteSlug = options.athleteSlug?.trim();
  const key =
    enabled && tenantSlug && athleteSlug
      ? `/api/public/${encodeURIComponent(tenantSlug)}/athletes/${encodeURIComponent(athleteSlug)}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<PublicAthleteResponse>(key, fetcher, {
    revalidateOnFocus: false,
  });

  const status = (error as { status?: number } | null)?.status;
  const isNotFound = status === 404;

  return {
    athlete: data?.athlete ?? null,
    conquistas: data?.conquistas ?? {
      titulosGrandesTorneios: [],
      titulosAnuais: [],
      titulosQuadrimestrais: [],
    },
    slug: data?.slug ?? tenantSlug ?? "",
    isLoading,
    isError: Boolean(error) && !isNotFound,
    isNotFound,
    error: error instanceof Error && !isNotFound ? error.message : null,
    mutate,
  };
}
