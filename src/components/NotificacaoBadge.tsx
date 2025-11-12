"use client";

import { FaBell } from "react-icons/fa";
import { useNotificationBadge } from "@/hooks/useNotificationBadge";

interface NotificacaoBadgeProps {
  tenantSlug?: string;
}

export default function NotificacaoBadge({ tenantSlug }: NotificacaoBadgeProps) {
  const { total } = useNotificationBadge({ tenantSlug, limit: 20 });

  return (
    <div className="relative flex items-center">
      <FaBell className="text-yellow-400 text-2xl" />
      {total > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-xs text-white font-bold rounded-full px-1.5 py-0.5 shadow">
          {total > 9 ? "9+" : total}
        </span>
      )}
    </div>
  );
}
