// src/app/admin/notificacoes/page.tsx
"use client";

import Head from "next/head";
import { useNotifications } from "@/hooks/useNotifications";
import type { NotificationType } from "@/types/notificacao";
import {
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaEnvelopeOpen,
  FaBell,
} from "react-icons/fa";

const ICONS: Partial<Record<NotificationType, JSX.Element>> = {
  ALERTA: <FaExclamationTriangle className="text-yellow-500" />,
  SISTEMA: <FaBell className="text-blue-400" />,
  PERSONALIZADA: <FaEnvelopeOpen className="text-green-400" />,
};

export default function NotificacoesPage() {
  const { notificacoes, isLoading, error, markAsRead } = useNotifications();

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Erro ao marcar notificação como lida:", error);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Notificações | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Veja todas as notificações do seu racha, mensagens do SuperAdmin e avisos do Fut7Pro."
        />
      </Head>
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-yellow-400 mb-6">Notificações</h1>
        {error && (
          <div className="mb-4 rounded border border-red-500 bg-red-900/30 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="text-center text-gray-400 py-8">Carregando...</div>
          ) : notificacoes.length === 0 ? (
            <div className="text-center text-gray-400 py-12">Nenhuma notificação encontrada.</div>
          ) : (
            notificacoes.map((notificacao) => {
              const Icon = ICONS[notificacao.type] ?? <FaInfoCircle className="text-blue-400" />;
              const isRead = notificacao.isRead;
              return (
                <div
                  key={notificacao.id}
                  className={`flex items-start gap-3 rounded-lg px-4 py-3 shadow border transition ${
                    isRead
                      ? "bg-zinc-900/60 border-zinc-800 text-zinc-300"
                      : "bg-zinc-900 border-yellow-700 shadow-yellow-900/20"
                  }`}
                >
                  <div className="mt-1">{Icon}</div>
                  <div className="flex-1">
                    <div className="font-bold text-base mb-1 text-yellow-300">
                      {notificacao.title}
                    </div>
                    <div className="text-sm text-zinc-100">{notificacao.message}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(notificacao.createdAt).toLocaleString("pt-BR")}
                    </div>
                  </div>
                  {!isRead && (
                    <button
                      className="ml-2 px-2 py-1 text-xs rounded bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition"
                      onClick={() => handleMarkAsRead(notificacao.id)}
                    >
                      Marcar como lida
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
