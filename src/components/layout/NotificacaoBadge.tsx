"use client";

import { FaBell } from "react-icons/fa";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificacaoBadgeProps {
  rachaSlug?: string;
  onClick?: () => void;
}

export default function NotificacaoBadge({ onClick }: NotificacaoBadgeProps) {
  const { unreadCount } = useNotifications();

  return (
    <button
      type="button"
      aria-label="Abrir notificações"
      className="relative focus:outline-none"
      onClick={onClick}
    >
      <FaBell className="text-yellow-400 text-2xl" />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-xs text-white rounded-full px-2 py-0.5 shadow font-bold z-10">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
