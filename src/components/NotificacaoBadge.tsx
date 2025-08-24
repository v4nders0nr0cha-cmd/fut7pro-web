"use client";

import { FaBell } from "react-icons/fa";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificacaoBadgeProps {
  rachaSlug: string;
}

export default function NotificacaoBadge({ rachaSlug }: NotificacaoBadgeProps) {
  const { unreadCount } = useNotifications(rachaSlug);

  return (
    <div className="relative flex items-center">
      <FaBell className="text-2xl text-yellow-400" />
      {unreadCount > 0 && (
        <span className="absolute -right-2 -top-2 rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white shadow">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </div>
  );
}
