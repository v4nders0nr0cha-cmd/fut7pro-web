"use client";

import useSWR from "swr";
import type { MeResponse } from "@/types/me";

const fetcher = async (url: string): Promise<MeResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || "Falha ao carregar perfil");
  }
  return res.json();
};

export function useMe(options?: {
  enabled?: boolean;
  tenantSlug?: string | null;
  context?: "athlete" | "admin";
}) {
  const enabled = options?.enabled ?? true;
  const params = new URLSearchParams();
  if (options?.tenantSlug) {
    const slug = options.tenantSlug.trim().toLowerCase();
    if (slug) {
      params.set("slug", slug);
    }
  }
  if (options?.context === "athlete") {
    params.set("context", "athlete");
  }
  const url = params.toString() ? `/api/me?${params.toString()}` : "/api/me";
  const { data, error, isLoading, mutate } = useSWR<MeResponse>(enabled ? url : null, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    me: data ?? null,
    isLoading,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}
