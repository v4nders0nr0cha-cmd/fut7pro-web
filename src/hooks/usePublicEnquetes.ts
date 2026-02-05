"use client";

import useSWR from "swr";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import type { PollListResponse, PollPublicItem } from "@/types/poll";

type UsePublicEnquetesOptions = {
  enabled?: boolean;
  status?: string;
  limit?: number;
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

const buildKey = (slug: string, options: UsePublicEnquetesOptions) => {
  const params = new URLSearchParams();
  if (options.status) params.set("status", options.status);
  if (options.limit) params.set("limit", String(options.limit));
  const query = params.toString();
  return query ? `/api/public/${slug}/enquetes?${query}` : `/api/public/${slug}/enquetes`;
};

export function usePublicEnquetes(options: UsePublicEnquetesOptions = {}) {
  const { publicSlug } = usePublicLinks();
  const enabled = options.enabled ?? true;
  const key = enabled && publicSlug ? buildKey(publicSlug, options) : null;

  const { data, error, isLoading, mutate } = useSWR<PollListResponse<PollPublicItem>>(
    key,
    fetcher,
    {
      refreshInterval: options.refreshInterval,
      revalidateOnFocus: false,
    }
  );

  return {
    enquetes: data?.results ?? [],
    nextCursor: data?.nextCursor ?? null,
    isLoading,
    isError: Boolean(error),
    error,
    mutate,
  };
}
