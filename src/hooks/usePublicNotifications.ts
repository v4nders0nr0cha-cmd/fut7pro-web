"use client";

import useSWR from "swr";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { useApiState } from "./useApiState";
import type { Notificacao } from "@/types/notificacao";

export type UsePublicNotificationsOptions = {
  enabled?: boolean;
  onlyUnread?: boolean;
  limit?: number;
  refreshInterval?: number;
};

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || "Erro ao buscar notificacoes");
  }
  return response.json();
};

const coerceDate = (value: unknown) => {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return undefined;
};

const normalizeNotification = (raw: any): Notificacao => {
  const metadata = raw?.metadata || {};
  const dataValue = coerceDate(raw?.createdAt) || coerceDate(raw?.updatedAt);
  const titleValue = raw?.title || metadata?.title || "";
  const messageValue = raw?.message || metadata?.message || "";
  const typeValue = raw?.type || metadata?.type || "outros";
  const readValue = typeof raw?.isRead === "boolean" ? raw.isRead : false;

  return {
    ...raw,
    rachaSlug: raw?.rachaSlug || raw?.slug || "",
    type: typeValue,
    title: raw?.title || titleValue,
    message: raw?.message || messageValue,
    titulo: titleValue,
    mensagem: messageValue,
    data: dataValue || "",
    lida: readValue,
    tipo: raw?.tipo || typeValue,
    metadata,
  };
};

const buildKey = (slug: string, options: UsePublicNotificationsOptions) => {
  const params = new URLSearchParams();
  if (options.onlyUnread) params.set("onlyUnread", "true");
  if (options.limit) params.set("limit", String(options.limit));
  const query = params.toString();
  return query ? `/api/public/${slug}/notifications?${query}` : `/api/public/${slug}/notifications`;
};

export function usePublicNotifications(options: UsePublicNotificationsOptions = {}) {
  const { publicSlug } = usePublicLinks();
  const apiState = useApiState();
  const enabled = options.enabled ?? true;

  const { data, error, isLoading, mutate } = useSWR<{ results: any[] }>(
    enabled && publicSlug ? buildKey(publicSlug, options) : null,
    fetcher,
    { refreshInterval: options.refreshInterval }
  );

  const normalized = Array.isArray(data?.results) ? data!.results.map(normalizeNotification) : [];

  const ensureOk = <T>(response: { data?: T; error?: string }) => {
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data;
  };

  const markAsRead = async (id: string) => {
    if (!publicSlug) return null;
    return apiState.handleAsync(async () => {
      const response = await fetch(`/api/public/${publicSlug}/notifications/${id}/read`, {
        method: "PATCH",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || "Erro ao marcar como lida");
      }
      await mutate();
      return ensureOk({ data: await response.json().catch(() => null) });
    });
  };

  return {
    notificacoes: normalized,
    unreadCount: normalized.filter((n) => !n.lida).length,
    isLoading: isLoading || apiState.isLoading,
    isError: !!error || apiState.isError,
    error: apiState.error || error,
    markAsRead,
    mutate,
  };
}
