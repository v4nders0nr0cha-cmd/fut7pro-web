"use client";

import useSWR from "swr";
import type { NotificationAnalytics, NotificationType } from "@/types/notificacao";

type UseNotificationAnalyticsParams = {
  start?: string;
  end?: string;
  days?: number;
  type?: NotificationType;
  limit?: number;
  slug?: string;
  enabled?: boolean;
};

const buildQueryString = (params?: UseNotificationAnalyticsParams) => {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  if (params.slug) searchParams.set("slug", params.slug);
  if (params.start) searchParams.set("start", params.start);
  if (params.end) searchParams.set("end", params.end);
  if (typeof params.days === "number") searchParams.set("days", String(params.days));
  if (typeof params.limit === "number") searchParams.set("limit", String(params.limit));
  if (params.type) searchParams.set("type", params.type);
  const query = searchParams.toString();
  return query.length ? `?${query}` : "";
};

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message =
      (payload && typeof payload.error === "string" && payload.error) ||
      "Falha ao carregar analytics";
    throw new Error(message);
  }
  const data = (await response.json()) as NotificationAnalytics;
  return data;
};

export function useNotificationAnalytics(params?: UseNotificationAnalyticsParams) {
  const query = buildQueryString(params);
  const key = params?.enabled === false ? null : `/api/admin/notificacoes/analytics${query}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<NotificationAnalytics>(
    key,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    analytics: data ?? null,
    isLoading: Boolean(key) && (isLoading ?? false),
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    isValidating,
    mutate,
  };
}
