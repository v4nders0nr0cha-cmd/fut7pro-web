import { useMemo } from "react";
import { useNotifications } from "./useNotifications";

type UseNotificationBadgeOptions = {
  tenantSlug?: string;
  limit?: number;
  enabled?: boolean;
};

export function useNotificationBadge(options?: UseNotificationBadgeOptions) {
  const { tenantSlug, limit, enabled } = options ?? {};

  const { unreadCount, isLoading, error, totalCount } = useNotifications({
    enabled,
    filters: {
      tenantSlug,
      unreadOnly: true,
      limit,
    },
    swr: {
      revalidateOnFocus: false,
    },
  });

  return useMemo(
    () => ({
      total: unreadCount,
      totalCount,
      isLoading,
      error,
    }),
    [unreadCount, totalCount, isLoading, error]
  );
}
