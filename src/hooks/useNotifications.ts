"use client";

import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { notificacoesApi } from "@/lib/api";
import { useApiState } from "./useApiState";
import type {
  Notification,
  NotificationType,
  CreateNotificationInput,
  UpdateNotificationInput,
} from "@/types/notificacao";
import type { SWRConfiguration, KeyedMutator } from "swr";

type NotificationsFilters = {
  tenantSlug?: string;
  type?: NotificationType;
  unreadOnly?: boolean;
  search?: string;
  limit?: number;
  start?: string;
  end?: string;
};

type UseNotificationsOptions = {
  filters?: NotificationsFilters;
  enabled?: boolean;
  swr?: SWRConfiguration<Notification[]>;
};

type NotificationsQuery = Record<string, string | number | boolean>;

type NotificationsKey = readonly ["notifications", NotificationsQuery];

type UseNotificationsReturn = {
  notificacoes: Notification[];
  totalCount: number;
  unreadCount: number;
  isLoading: boolean;
  isValidating: boolean;
  isError: boolean;
  error: string | null;
  isSuccess: boolean;
  mutate: KeyedMutator<Notification[]>;
  createNotification: (data: CreateNotificationInput) => Promise<Notification | null>;
  updateNotification: (id: string, data: UpdateNotificationInput) => Promise<Notification | null>;
  markAsRead: (id: string) => Promise<Notification | null>;
  markAllAsRead: () => Promise<{ updated: number; failed?: number } | null>;
  deleteNotificacao: (id: string) => Promise<void | null>;
  getNotificacaoById: (id: string) => Notification | undefined;
  getNotificacoesNaoLidas: () => Notification[];
  getNotificacoesPorTipo: (tipo: NotificationType) => Notification[];
  reset: () => void;
};

type UseNotificationsArg = string | UseNotificationsOptions | undefined;

function buildFilters(arg?: UseNotificationsArg): NotificationsFilters {
  if (!arg) return {};
  if (typeof arg === "string") {
    return { tenantSlug: arg };
  }
  return arg.filters ?? {};
}

function buildEnabled(arg?: UseNotificationsArg): boolean {
  if (!arg) return true;
  if (typeof arg === "string") return true;
  return arg.enabled ?? true;
}

function buildSWRConfig(arg?: UseNotificationsArg): SWRConfiguration<Notification[]> | undefined {
  if (!arg || typeof arg === "string") return undefined;
  return arg.swr;
}

export function useNotifications(): UseNotificationsReturn;
export function useNotifications(tenantSlug: string): UseNotificationsReturn;
export function useNotifications(options: UseNotificationsOptions): UseNotificationsReturn;
export function useNotifications(arg?: UseNotificationsArg): UseNotificationsReturn {
  const filters = buildFilters(arg);
  const enabled = buildEnabled(arg);
  const swrConfig = buildSWRConfig(arg);

  const query = useMemo(() => {
    const params: Record<string, string | number | boolean> = {};
    if (filters.tenantSlug) params.slug = filters.tenantSlug;
    if (filters.type) params.type = filters.type;
    if (filters.unreadOnly) params.isRead = false;
    if (filters.search) params.search = filters.search;
    if (typeof filters.limit === "number") params.limit = filters.limit;
    if (filters.start) params.start = filters.start;
    if (filters.end) params.end = filters.end;
    return params;
  }, [
    filters.end,
    filters.limit,
    filters.search,
    filters.start,
    filters.tenantSlug,
    filters.type,
    filters.unreadOnly,
  ]);

  const swrKey = useMemo<NotificationsKey | null>(() => {
    if (!enabled) return null;
    return ["notifications", query] as const;
  }, [enabled, query]);

  const apiState = useApiState();

  const { data, error, isLoading, isValidating, mutate } = useSWR<
    Notification[],
    Error,
    NotificationsKey | null
  >(swrKey, async ([, params]) => notificacoesApi.list(params), {
    keepPreviousData: true,
    revalidateOnFocus: true,
    ...swrConfig,
  });

  const handleMutation = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      const result = await apiState.handleAsync(async () => {
        const response = await fn();
        await mutate();
        return response;
      });
      return result;
    },
    [apiState, mutate]
  );

  const createNotification = useCallback(
    (payload: CreateNotificationInput) => handleMutation(() => notificacoesApi.create(payload)),
    [handleMutation]
  );

  const updateNotification = useCallback(
    (id: string, payload: UpdateNotificationInput) =>
      handleMutation(() => notificacoesApi.update(id, payload)),
    [handleMutation]
  );

  const markAsRead = useCallback(
    (id: string) => handleMutation(() => notificacoesApi.markAsRead(id)),
    [handleMutation]
  );

  const markAllAsRead = useCallback(
    () => handleMutation(() => notificacoesApi.markAllAsRead()),
    [handleMutation]
  );

  const deleteNotificacao = useCallback(
    (id: string) =>
      handleMutation(async () => {
        await notificacoesApi.delete(id);
      }),
    [handleMutation]
  );

  const notificacoes = data ?? [];
  const unread = useMemo(() => notificacoes.filter((item) => !item.isRead), [notificacoes]);

  const getNotificacaoById = useCallback(
    (id: string) => notificacoes.find((item) => item.id === id),
    [notificacoes]
  );

  const getNotificacoesPorTipo = useCallback(
    (tipo: NotificationType) => notificacoes.filter((item) => item.type === tipo),
    [notificacoes]
  );

  const swrError = error instanceof Error ? error.message : error ? String(error) : null;

  return {
    notificacoes,
    totalCount: notificacoes.length,
    unreadCount: unread.length,
    isLoading: (isLoading ?? false) || apiState.isLoading,
    isValidating: isValidating ?? false,
    isError: Boolean(error) || apiState.isError,
    error: apiState.error ?? swrError,
    isSuccess: apiState.isSuccess && !error,
    mutate,
    createNotification,
    updateNotification,
    markAsRead,
    markAllAsRead,
    deleteNotificacao,
    getNotificacaoById,
    getNotificacoesNaoLidas: () => unread,
    getNotificacoesPorTipo,
    reset: apiState.reset,
  };
}
