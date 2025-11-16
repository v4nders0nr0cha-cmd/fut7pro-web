"use client";

import { useMemo } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useNotifications } from "@/hooks/useNotifications";

export default function ListaNotificacoes() {
  const { notificacoes, isLoading, isError, error, markAsRead, mutate } = useNotifications({
    filters: { unreadOnly: true, limit: 5 },
    enabled: true,
  });

  const sorted = useMemo(
    () =>
      [...notificacoes].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [notificacoes]
  );

  const handleResolver = async (id: string) => {
    try {
      await markAsRead(id);
      await mutate();
    } catch {
      // erros são tratados pelo hook; mantemos interface responsiva
    }
  };

  if (isLoading) {
    return (
      <div className="text-gray-300 bg-[#1e1e1e] border border-zinc-800 rounded p-4 animate-pulse">
        Carregando notificações...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-300 bg-red-900/40 border border-red-700 rounded p-4 flex items-center gap-2">
        <FaTimesCircle className="text-red-400" />
        <span>{error ?? "Não foi possível carregar as notificações."}</span>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="text-green-400 bg-green-900 border border-green-700 p-4 rounded shadow">
        Nenhuma pendência encontrada. Tudo certo no seu racha! ✅
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {sorted.map((notificacao) => (
        <li
          key={notificacao.id}
          className="bg-[#1e1e1e] border-l-4 border-yellow-500 rounded shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div>
            <p className="text-sm text-yellow-400 font-semibold">
              {notificacao.type === "ALERTA"
                ? "Alerta"
                : notificacao.type === "SISTEMA"
                  ? "Sistema"
                  : "Personalizada"}
            </p>
            <p className="text-base text-white">{notificacao.title}</p>
            <p className="text-sm text-gray-400">{notificacao.message}</p>
          </div>
          <button
            onClick={() => handleResolver(notificacao.id)}
            className="flex items-center gap-2 px-3 py-1 rounded text-sm bg-green-600 hover:bg-green-500 text-white transition disabled:opacity-60"
          >
            <FaCheckCircle /> Marcar como resolvido
          </button>
        </li>
      ))}
    </ul>
  );
}
