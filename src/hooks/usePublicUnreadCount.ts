"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { useAuth } from "@/hooks/useAuth";

const NO_AUTO_RETRY_STATUSES = new Set([401, 403, 429]);
const AUTH_PAUSE_STATUSES = new Set([401, 403]);
const DEFAULT_RATE_LIMIT_PAUSE_MS = 60_000;

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
  const [pausedByRateLimit, setPausedByRateLimit] = useState(false);
  const rateLimitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldFetch = enabled && isAuthenticated && !!publicSlug;
  const key = shouldFetch ? `/api/public/${publicSlug}/notifications/unread-count` : null;

  useEffect(() => {
    return () => {
      if (rateLimitTimeoutRef.current) {
        clearTimeout(rateLimitTimeoutRef.current);
      }
    };
  }, []);

  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    refreshInterval: pausedByAuthError || pausedByRateLimit ? 0 : refreshInterval,
    revalidateOnFocus: false,
    onSuccess: () => {
      setPausedByAuthError(false);
      setPausedByRateLimit(false);
    },
    onError: (err) => {
      const status = (err as FetchError | undefined)?.status;
      setPausedByAuthError(Boolean(status && AUTH_PAUSE_STATUSES.has(status)));
      if (status === 429) {
        const retryAfter = (err as FetchError | undefined)?.retryAfter;
        const retryAfterSeconds = retryAfter ? Number.parseInt(retryAfter, 10) : NaN;
        const delayMs =
          Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
            ? retryAfterSeconds * 1000
            : DEFAULT_RATE_LIMIT_PAUSE_MS;

        setPausedByRateLimit(true);
        if (rateLimitTimeoutRef.current) {
          clearTimeout(rateLimitTimeoutRef.current);
        }
        rateLimitTimeoutRef.current = setTimeout(() => {
          setPausedByRateLimit(false);
          void mutate();
        }, delayMs);
      }
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
