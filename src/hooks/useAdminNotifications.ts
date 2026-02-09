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
    throw new Error(payload?.error || payload?.message || "Falha ao carregar notificações.");
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
  const refreshInterval = options.refreshInterval ?? 30_000;

  const countKey = enabled ? "/api/admin/notifications/unread-count" : null;
  const listKey = enabled && includeList ? buildListKey(options) : null;

  const {
    data: countData,
    error: countError,
    isLoading: isCountLoading,
    mutate: mutateCount,
  } = useSWR<AdminNotificationsCountResponse>(countKey, fetchJson, {
    refreshInterval,
    revalidateOnFocus: true,
  });

  const {
    data: listData,
    error: listError,
    isLoading: isListLoading,
    mutate: mutateList,
  } = useSWR<AdminNotificationsListResponse>(listKey, fetchJson, {
    refreshInterval: includeList ? refreshInterval : 0,
    revalidateOnFocus: true,
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
