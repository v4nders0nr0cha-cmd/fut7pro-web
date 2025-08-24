// src/components/layout/NotificacaoBadge.tsx
"use client";

import { FaBell } from "react-icons/fa";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificacaoBadgeProps {
  rachaSlug: string; // passe o slug do racha atual
  onClick?: () => void; // exibir notificações, abrir drawer/modal etc
}

export default function NotificacaoBadge({
  rachaSlug,
  onClick,
}: NotificacaoBadgeProps) {
  const { unreadCount } = useNotifications(rachaSlug);

  return (
    <button
      type="button"
      aria-label="Abrir notificações"
      className="relative focus:outline-none"
      onClick={onClick}
    >
      <FaBell className="text-2xl text-yellow-400" />
      {unreadCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 z-10 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white shadow">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
