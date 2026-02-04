"use client";

import useSWR from "swr";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { useAuth } from "@/hooks/useAuth";

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  const text = await response.text();
  let body: any = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    const message = body?.error || body?.message || "Erro ao buscar";
    throw new Error(message);
  }
  return body as { unreadCount?: number };
};

export function usePublicUnreadCount(enabled = true, refreshInterval = 30000) {
  const { publicSlug } = usePublicLinks();
  const { isAuthenticated } = useAuth();
  const shouldFetch = enabled && isAuthenticated && !!publicSlug;
  const key = shouldFetch ? `/api/public/${publicSlug}/notifications/unread-count` : null;
  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    refreshInterval,
    revalidateOnFocus: false,
  });

  return {
    unreadCount: data?.unreadCount ?? 0,
    isLoading,
    error,
    mutate,
  };
}
