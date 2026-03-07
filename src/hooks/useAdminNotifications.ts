"use client";

import useSWR from "swr";

export type AdminNotificationType =
  | "SUGGESTION_RECEIVED"
  | "SUGGESTION_UPDATED"
  | "MESSAGE_RECEIVED"
  | "ATHLETE_REQUEST_PENDING"
  | "SYSTEM_ANNOUNCEMENT";

export type AdminNotificationItem = {
  id: string;
  tenantId?: string | null;
  recipientType: "ADMIN" | "ATHLETE" | "SUPERADMIN";
  recipientId: string;
  type: AdminNotificationType;
  title: string;
  body: string;
  href?: string | null;
  readAt?: string | null;
  isRead: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

type AdminNotificationsListResponse = {
  results?: AdminNotificationItem[];
  total?: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
};

type AdminNotificationsCountResponse = {
  count?: number;
};

type UseAdminNotificationsOptions = {
  enabled?: boolean;
  includeList?: boolean;
  page?: number;
  limit?: number;
  unread?: boolean;
  type?: AdminNotificationType;
  refreshInterval?: number;
};

type FetchHttpError = Error & {
  status?: number;
  retryAfterMs?: number;
};

const parseRetryAfterMs = (headerValue: string | null): number | undefined => {
  if (!headerValue) return undefined;
  const seconds = Number(headerValue);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.round(seconds * 1000);
  }
  const retryDate = new Date(headerValue).getTime();
  if (Number.isFinite(retryDate)) {
    return Math.max(0, retryDate - Date.now());
  }
  return undefined;
};

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, { cache: "no-store" });
  const text = await response.text();
  let payload: any = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    const error = new Error(
      payload?.error || payload?.message || "Falha ao carregar notificações."
    ) as FetchHttpError;
    error.status = response.status;
    error.retryAfterMs = parseRetryAfterMs(response.headers.get("retry-after"));
    throw error;
  }

  return payload as T;
};

const buildListKey = (options: UseAdminNotificationsOptions) => {
  const params = new URLSearchParams();
  if (options.page && options.page > 1) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));
  if (typeof options.unread === "boolean") params.set("unread", String(options.unread));
  if (options.type) params.set("type", options.type);
  const query = params.toString();
  return query ? `/api/admin/notifications?${query}` : "/api/admin/notifications";
};

export function useAdminNotifications(options: UseAdminNotificationsOptions = {}) {
  const enabled = options.enabled ?? true;
  const includeList = options.includeList ?? true;
  const refreshInterval = options.refreshInterval ?? 60_000;
  const resolveRefreshInterval = () => {
    if (typeof document !== "undefined" && document.visibilityState !== "visible") {
      return 0;
    }
    return refreshInterval;
  };

  const countKey = enabled ? "/api/admin/notifications/unread-count" : null;
  const listKey = enabled && includeList ? buildListKey(options) : null;

  const {
    data: countData,
    error: countError,
    isLoading: isCountLoading,
    mutate: mutateCount,
  } = useSWR<AdminNotificationsCountResponse>(countKey, fetchJson, {
    refreshInterval: resolveRefreshInterval,
    revalidateOnFocus: false,
    refreshWhenHidden: false,
    dedupingInterval: 10_000,
    shouldRetryOnError: true,
    onErrorRetry: (error, _key, _config, revalidate, opts) => {
      const httpError = error as FetchHttpError;
      const status = httpError.status ?? 0;
      if (opts.retryCount >= 2 || [400, 401, 403, 404].includes(status)) {
        return;
      }
      const fallbackDelay = 1_000 * 2 ** opts.retryCount;
      const retryDelayMs =
        status === 429
          ? Math.max(httpError.retryAfterMs ?? 0, fallbackDelay)
          : fallbackDelay;
      window.setTimeout(() => revalidate({ retryCount: opts.retryCount + 1 }), retryDelayMs);
    },
  });

  const {
    data: listData,
    error: listError,
    isLoading: isListLoading,
    mutate: mutateList,
  } = useSWR<AdminNotificationsListResponse>(listKey, fetchJson, {
    refreshInterval: includeList ? resolveRefreshInterval : 0,
    revalidateOnFocus: false,
    refreshWhenHidden: false,
    dedupingInterval: 10_000,
    shouldRetryOnError: true,
    onErrorRetry: (error, _key, _config, revalidate, opts) => {
      const httpError = error as FetchHttpError;
      const status = httpError.status ?? 0;
      if (opts.retryCount >= 2 || [400, 401, 403, 404].includes(status)) {
        return;
      }
      const fallbackDelay = 1_000 * 2 ** opts.retryCount;
      const retryDelayMs =
        status === 429
          ? Math.max(httpError.retryAfterMs ?? 0, fallbackDelay)
          : fallbackDelay;
      window.setTimeout(() => revalidate({ retryCount: opts.retryCount + 1 }), retryDelayMs);
    },
  });

  const markAsRead = async (id: string) => {
    const response = await fetch(`/api/admin/notifications/${id}/read`, {
      method: "PATCH",
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        payload?.error || payload?.message || "Falha ao marcar notificação como lida."
      );
    }

    await Promise.all([mutateCount(), mutateList()]);
    return payload;
  };

  const markAllAsRead = async () => {
    const response = await fetch("/api/admin/notifications/read-all", {
      method: "PATCH",
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        payload?.error || payload?.message || "Falha ao marcar notificações como lidas."
      );
    }

    await Promise.all([mutateCount(), mutateList()]);
    return payload;
  };

  return {
    notifications: (Array.isArray(listData?.results)
      ? listData?.results
      : []) as AdminNotificationItem[],
    total: typeof listData?.total === "number" ? listData.total : 0,
    page: typeof listData?.page === "number" ? listData.page : (options.page ?? 1),
    limit: typeof listData?.limit === "number" ? listData.limit : (options.limit ?? 20),
    hasMore: Boolean(listData?.hasMore),
    unreadCount: typeof countData?.count === "number" ? countData.count : 0,
    isLoading: enabled ? isCountLoading || (includeList ? isListLoading : false) : false,
    isError: Boolean(countError || listError),
    error: (countError || listError) as Error | undefined,
    mutate: async () => Promise.all([mutateCount(), mutateList()]),
    markAsRead,
    markAllAsRead,
  };
}
