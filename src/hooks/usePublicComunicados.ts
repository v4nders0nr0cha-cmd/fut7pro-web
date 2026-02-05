"use client";

import useSWR from "swr";
import { useAuth } from "@/hooks/useAuth";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import type { ComunicadoPublicResponse } from "@/types/comunicado";

const fetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, { cache: "no-store" });
  const text = await response.text();
  let body: any = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    throw new Error(body?.error || body?.message || "Falha ao carregar comunicados");
  }
  return body as T;
};

export function usePublicComunicados(options: { enabled?: boolean; days?: number } = {}) {
  const { publicSlug } = usePublicLinks();
  const { isAuthenticated } = useAuth();
  const enabled = options.enabled ?? true;
  const shouldFetch = enabled && isAuthenticated && !!publicSlug;
  const days = options.days ?? 30;
  const key = shouldFetch ? `/api/public/${publicSlug}/comunicados?days=${days}` : null;

  const { data, error, isLoading, mutate } = useSWR<ComunicadoPublicResponse>(key, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data,
    active: data?.active ?? [],
    archivedRecent: data?.archivedRecent ?? [],
    isLoading,
    error,
    mutate,
  };
}

export function useActiveComunicados(enabled = true) {
  const { publicSlug } = usePublicLinks();
  const { isAuthenticated } = useAuth();
  const shouldFetch = enabled && isAuthenticated && !!publicSlug;
  const key = shouldFetch ? `/api/public/${publicSlug}/comunicados/active` : null;

  const { data, error, isLoading, mutate } = useSWR<{ active: any[] }>(key, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    active: data?.active ?? [],
    isLoading,
    error,
    mutate,
  };
}
