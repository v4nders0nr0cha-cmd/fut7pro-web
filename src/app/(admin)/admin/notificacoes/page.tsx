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
  const { notificacoes, fetchNotifications, loading } = useNotifications(rachaSlug);

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
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-yellow-400 mb-6">Notificações</h1>
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="text-center text-gray-400 py-8">Carregando...</div>
          ) : notificacoes.length === 0 ? (
            <div className="text-center text-gray-400 py-12">Nenhuma notificação encontrada.</div>
          ) : (
            notificacoes.map((not) => (
              <div
                key={not.id}
                className={`flex items-start gap-3 rounded-lg px-4 py-3 shadow ${
                  not.lida
                    ? "bg-[#222] text-gray-400 opacity-80"
                    : "bg-[#23272F] text-white border-l-4 border-yellow-400"
                }`}
              >
                <div className="mt-1">{ICONS[not.type] || ICONS["outros"]}</div>
                <div className="flex-1">
                  <div className="font-bold text-base mb-1">{not.titulo}</div>
                  <div className="text-sm">{not.mensagem}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(not.data).toLocaleString("pt-BR")}
                  </div>
                </div>
                {!not.lida && (
                  <button
                    className="ml-2 px-2 py-1 text-xs rounded bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition"
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
