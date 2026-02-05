"use client";

import useSWR from "swr";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import type { PollPublicDetail } from "@/types/poll";

type UsePublicEnqueteOptions = {
  enabled?: boolean;
  refreshInterval?: number;
};

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
    const message = body?.error || body?.message || "Falha ao carregar";
    throw new Error(message);
  }
  return body as T;
};

export function usePublicEnquete(id?: string, options: UsePublicEnqueteOptions = {}) {
  const { publicSlug } = usePublicLinks();
  const enabled = options.enabled ?? true;
  const key = enabled && publicSlug && id ? `/api/public/${publicSlug}/enquetes/${id}` : null;

  const { data, error, isLoading, mutate } = useSWR<PollPublicDetail>(key, fetcher, {
    refreshInterval: options.refreshInterval,
    revalidateOnFocus: false,
  });

  const vote = async (optionIds: string[]) => {
    if (!publicSlug || !id) return null;
    const response = await fetch(`/api/public/${publicSlug}/enquetes/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionIds }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body?.error || body?.message || "Falha ao registrar voto");
    }
    await mutate();
    return body;
  };

  return {
    enquete: data ?? null,
    isLoading,
    isError: Boolean(error),
    error,
    mutate,
    vote,
  };
}
