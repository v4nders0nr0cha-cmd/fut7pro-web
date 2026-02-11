"use client";

import { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";

export default function ListaNotificacoes() {
  const { notifications, isLoading, isError, error, markAsRead } = useAdminNotifications({
    includeList: true,
    limit: 20,
    unread: true,
  });
  const [actionError, setActionError] = useState<string | null>(null);

  const handleMarkAsRead = async (id: string) => {
    setActionError(null);
    try {
      await markAsRead(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Não foi possível atualizar.");
    }
  };

  if (isLoading) {
    return <div className="text-zinc-300">Carregando notificações...</div>;
  }

  if (isError) {
    return (
      <div className="text-red-300 bg-red-900/30 border border-red-700 p-4 rounded shadow">
        {(error as Error | undefined)?.message || "Erro ao carregar notificações."}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-green-300 bg-green-900/30 border border-green-700 p-4 rounded shadow">
        Nenhuma pendência encontrada. Tudo certo no seu racha.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {actionError && (
        <div className="bg-red-900/30 border border-red-700 px-3 py-2 rounded text-sm text-red-200">
          {actionError}
        </div>
      )}
      <ul className="space-y-4">
        {notifications.map((notification) => (
          <li
            key={notification.id}
            className="bg-[#1e1e1e] border-l-4 border-yellow-500 rounded shadow p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm text-yellow-400 font-semibold">{notification.title}</p>
              <p className="text-base text-white">{notification.body}</p>
            </div>
            <button
              type="button"
              onClick={() => void handleMarkAsRead(notification.id)}
              className="flex items-center gap-2 px-3 py-1 rounded text-sm bg-green-600 hover:bg-green-500 text-white transition"
            >
              <FaCheckCircle />
              Marcar como lida
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
