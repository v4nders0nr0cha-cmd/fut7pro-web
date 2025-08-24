// src/app/admin/notificacoes/page.tsx
"use client";

import Head from "next/head";
import { useNotifications } from "@/hooks/useNotifications";
import {
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaEnvelopeOpen,
  FaBell,
} from "react-icons/fa";

const ICONS: Record<string, JSX.Element> = {
  info: <FaInfoCircle className="text-blue-400" />,
  success: <FaCheckCircle className="text-green-400" />,
  error: <FaTimesCircle className="text-red-400" />,
  warning: <FaExclamationTriangle className="text-yellow-400" />,
  alert: <FaExclamationTriangle className="text-yellow-500" />,
  system: <FaBell className="text-yellow-400" />,
  superadmin: <FaBell className="text-yellow-400" />,
  mensagem: <FaEnvelopeOpen className="text-blue-400" />,
  pendencia: <FaExclamationTriangle className="text-red-500" />,
  financeiro: <FaExclamationTriangle className="text-green-400" />,
  novidade: <FaInfoCircle className="text-blue-400" />,
  contato: <FaEnvelopeOpen className="text-blue-400" />,
  outros: <FaBell className="text-gray-400" />,
};

export default function NotificacoesPage() {
  // Troque "slug-do-racha" para buscar do contexto/session conforme seu projeto SaaS
  const rachaSlug = "slug-do-racha";
  const { notificacoes, fetchNotifications, loading } =
    useNotifications(rachaSlug);

  // Marcar como lida
  const marcarNotificacaoComoLida = async (id: string) => {
    await fetch(`/api/admin/notifications/read/${id}`, { method: "POST" });
    fetchNotifications();
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
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <h1 className="mb-6 text-2xl font-bold text-yellow-400">
          Notificações
        </h1>
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="py-8 text-center text-gray-400">Carregando...</div>
          ) : notificacoes.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              Nenhuma notificação encontrada.
            </div>
          ) : (
            notificacoes.map((not) => (
              <div
                key={not.id}
                className={`flex items-start gap-3 rounded-lg px-4 py-3 shadow ${
                  not.lida
                    ? "bg-[#222] text-gray-400 opacity-80"
                    : "border-l-4 border-yellow-400 bg-[#23272F] text-white"
                }`}
              >
                <div className="mt-1">{ICONS[not.type] || ICONS["outros"]}</div>
                <div className="flex-1">
                  <div className="mb-1 text-base font-bold">{not.titulo}</div>
                  <div className="text-sm">{not.mensagem}</div>
                  <div className="mt-2 text-xs text-gray-500">
                    {new Date(not.data).toLocaleString("pt-BR")}
                  </div>
                </div>
                {!not.lida && (
                  <button
                    className="ml-2 rounded bg-yellow-400 px-2 py-1 text-xs font-bold text-black transition hover:bg-yellow-500"
                    onClick={() => marcarNotificacaoComoLida(not.id)}
                  >
                    Marcar como lida
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
