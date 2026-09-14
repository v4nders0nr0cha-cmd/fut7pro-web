"use client";

import { useState } from "react";
import useSWR from "swr";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { useAuth } from "@/hooks/useAuth";

const NO_AUTO_RETRY_STATUSES = new Set([401, 403, 429]);

type FetchError = Error & { status?: number; retryAfter?: string | null };

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
    const error = new Error(message) as FetchError;
    error.status = response.status;
    error.retryAfter = response.headers.get("retry-after");
    throw error;
  }
  return body as { unreadCount?: number };
};

export function usePublicUnreadCount(enabled = true, refreshInterval = 30000) {
  const { publicSlug } = usePublicLinks();
  const { isAuthenticated } = useAuth();
  const [pausedByAuthError, setPausedByAuthError] = useState(false);
  const shouldFetch = enabled && isAuthenticated && !!publicSlug;
  const key = shouldFetch ? `/api/public/${publicSlug}/notifications/unread-count` : null;
  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    refreshInterval: pausedByAuthError ? 0 : refreshInterval,
    revalidateOnFocus: false,
    onSuccess: () => setPausedByAuthError(false),
    onError: (err) => {
      const status = (err as FetchError | undefined)?.status;
      setPausedByAuthError(Boolean(status && NO_AUTO_RETRY_STATUSES.has(status)));
    },
    shouldRetryOnError: (err) => {
      const status = (err as FetchError | undefined)?.status;
      return !status || !NO_AUTO_RETRY_STATUSES.has(status);
    },
    errorRetryCount: 1,
  });

  return {
    unreadCount: data?.unreadCount ?? 0,
    isLoading,
    error,
    mutate,
  };
}
