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
      <FaBell className="text-yellow-400 text-2xl" />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-xs text-white font-bold rounded-full px-1.5 py-0.5 shadow">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </div>
  );
}
