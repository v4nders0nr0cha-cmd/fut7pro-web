"use client";

import useSWR from "swr";
import type { Patrocinador } from "@/types/patrocinador";
import { normalizeSponsor } from "@/lib/normalize-sponsor";

const JSON_CT = "application/json";

async function fetchPublicSponsors(url: string): Promise<Patrocinador[]> {
  const response = await fetch(url, {
    headers: { Accept: JSON_CT },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error ?? "Erro ao carregar patrocinadores públicos");
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(normalizeSponsor);
}

export function usePublicSponsors(slug: string | null | undefined) {
  const key = slug ? `/api/public/sponsors?slug=${slug}` : null;

  const { data, error, isLoading, mutate } = useSWR<Patrocinador[]>(key, fetchPublicSponsors, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  return {
    patrocinadores: data ?? [],
    isLoading,
    isError: !!error,
    error: error?.message,
    mutate,
  };
}
