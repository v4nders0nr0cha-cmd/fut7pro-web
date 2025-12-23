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

export function useMe() {
  const { data, error, isLoading, mutate } = useSWR<MeResponse>("/api/me", fetcher, {
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
