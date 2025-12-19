// src/hooks/useNotifications.ts
"use client";

import useSWR from "swr";
import { useRacha } from "@/context/RachaContext";
import { notificacoesApi } from "@/lib/api";
import { useApiState } from "./useApiState";
import type { Notificacao } from "@/types/notificacao";

type UseNotificationsOptions = {
  enabled?: boolean;
  type?: string;
  isRead?: boolean;
  search?: string;
  limit?: number;
};

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erro ao buscar notificações");
  }
  return response.json();
};

const coerceDate = (value: unknown) => {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return undefined;
};

const normalizeNotification = (raw: any): Notificacao => {
  const dataValue =
    coerceDate(raw?.data) || coerceDate(raw?.createdAt) || coerceDate(raw?.updatedAt);
  const titleValue =
    raw?.titulo || raw?.title || raw?.metadata?.titulo || raw?.metadata?.title || "";
  const messageValue =
    raw?.mensagem || raw?.message || raw?.metadata?.mensagem || raw?.metadata?.message || "";
  const typeValue =
    raw?.type ||
    raw?.tipo ||
    raw?.metadata?.type ||
    raw?.metadata?.tipo ||
    raw?.category ||
    "outros";
  const readValue =
    typeof raw?.lida === "boolean"
      ? raw.lida
      : typeof raw?.isRead === "boolean"
        ? raw.isRead
        : false;

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
  };
};

const buildKey = (rachaId: string, options: UseNotificationsOptions) => {
  const search = new URLSearchParams();
  search.set("rachaId", rachaId);
  if (options.type) search.set("type", options.type);
  if (typeof options.isRead === "boolean") search.set("isRead", String(options.isRead));
  if (options.search) search.set("search", options.search);
  if (options.limit) search.set("limit", String(options.limit));
  return `/api/notificacoes?${search.toString()}`;
};

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { rachaId } = useRacha();
  const apiState = useApiState();
  const enabled = options.enabled ?? true;

  const { data, error, isLoading, mutate } = useSWR<Notificacao[]>(
    enabled && rachaId ? buildKey(rachaId, options) : null,
    fetcher,
    {
      onError: (err) => {
        if (process.env.NODE_ENV === "development") {
          console.log("Erro ao carregar notificações:", err);
        }
      },
    }
  );

  const normalized = (
    Array.isArray(data) ? data : Array.isArray((data as any)?.results) ? (data as any).results : []
  ).map(normalizeNotification);

  const ensureOk = <T>(response: { data?: T; error?: string }) => {
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data;
  };

  const markAsRead = async (id: string) => {
    return apiState.handleAsync(async () => {
      const response = await notificacoesApi.markAsRead(id);
      ensureOk(response);
      await mutate();
      return response.data;
    });
  };

  const markAllAsRead = async () => {
    return apiState.handleAsync(async () => {
      const unread = normalized.filter((n) => !n.lida);
      if (unread.length === 0) return [];
      const results = await Promise.all(unread.map((n) => notificacoesApi.markAsRead(n.id)));
      results.forEach(ensureOk);
      await mutate();
      return results.map((result) => result.data);
    });
  };

  const deleteNotificacao = async (id: string) => {
    return apiState.handleAsync(async () => {
      const response = await notificacoesApi.delete(id);
      ensureOk(response);
      await mutate();
      return response.data;
    });
  };

  const getNotificacaoById = (id: string) => {
    return normalized.find((n) => n.id === id);
  };

  const getNotificacoesNaoLidas = () => {
    return normalized.filter((n) => !n.lida);
  };

  const getNotificacoesPorTipo = (tipo: string) => {
    return (
      normalized.filter((n) => {
        const currentType = (n as any).tipo ?? n.type;
        return currentType === tipo;
      }) || []
    );
  };

  return {
    notificacoes: normalized,
    unreadCount: getNotificacoesNaoLidas().length,
    isLoading: isLoading || apiState.isLoading,
    isError: !!error || apiState.isError,
    error: apiState.error,
    isSuccess: apiState.isSuccess,
    mutate,
    markAsRead,
    markAllAsRead,
    deleteNotificacao,
    getNotificacaoById,
    getNotificacoesNaoLidas,
    getNotificacoesPorTipo,
    reset: apiState.reset,
  };
}
