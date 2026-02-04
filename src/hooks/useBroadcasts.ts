"use client";

import useSWR from "swr";
import type { BroadcastGroupsPreviewResponse, BroadcastListResponse } from "@/types/broadcast";

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

export function useBroadcastGroupsPreview(groupKey?: string) {
  const params = new URLSearchParams();
  if (groupKey) params.set("groupKey", groupKey);
  const query = params.toString();
  const key = query
    ? `/api/admin/comunicacao/notificacoes/groups/preview?${query}`
    : "/api/admin/comunicacao/notificacoes/groups/preview";

  const { data, error, isLoading, mutate } = useSWR<BroadcastGroupsPreviewResponse>(key, fetcher, {
    revalidateOnFocus: false,
  });

  return { data, error, isLoading, mutate };
}

type BroadcastHistoryOptions = {
  groupKey?: string;
  channel?: string;
  from?: string;
  to?: string;
  limit?: number;
};

export function useBroadcastHistory(options: BroadcastHistoryOptions = {}) {
  const params = new URLSearchParams();
  if (options.groupKey) params.set("groupKey", options.groupKey);
  if (options.channel) params.set("channel", options.channel);
  if (options.from) params.set("from", options.from);
  if (options.to) params.set("to", options.to);
  if (options.limit) params.set("limit", String(options.limit));

  const query = params.toString();
  const key = query
    ? `/api/admin/comunicacao/notificacoes?${query}`
    : "/api/admin/comunicacao/notificacoes";

  const { data, error, isLoading, mutate } = useSWR<BroadcastListResponse>(key, fetcher, {
    revalidateOnFocus: false,
  });

  return { data, error, isLoading, mutate };
}
