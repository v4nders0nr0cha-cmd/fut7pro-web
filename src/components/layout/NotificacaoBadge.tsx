// src/components/layout/NotificacaoBadge.tsx
"use client";

import { FaBell } from "react-icons/fa";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificacaoBadgeProps {
  rachaSlug: string; // passe o slug do racha atual
  onClick?: () => void; // exibir notificações, abrir drawer/modal etc
}

export default function NotificacaoBadge({ rachaSlug, onClick }: NotificacaoBadgeProps) {
  const { unreadCount } = useNotifications(rachaSlug);

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
