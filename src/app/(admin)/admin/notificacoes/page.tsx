// src/app/admin/notificacoes/page.tsx
"use client";

import Head from "next/head";
import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { FaInfoCircle, FaExclamationTriangle, FaEnvelopeOpen, FaBell } from "react-icons/fa";

const ICONS: Record<string, JSX.Element> = {
  system: <FaBell className="text-yellow-400" />,
  superadmin: <FaBell className="text-yellow-400" />,
  mensagem: <FaEnvelopeOpen className="text-blue-400" />,
  pendencia: <FaExclamationTriangle className="text-red-500" />,
  financeiro: <FaExclamationTriangle className="text-green-400" />,
  alerta: <FaExclamationTriangle className="text-yellow-500" />,
  novidade: <FaInfoCircle className="text-blue-400" />,
  contato: <FaEnvelopeOpen className="text-blue-400" />,
  outros: <FaBell className="text-gray-400" />,
};

export default function NotificacoesPage() {
  const { notificacoes, unreadCount, isLoading, isError, error, markAsRead, markAllAsRead } =
    useNotifications();

  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<"todas" | "lidas" | "naoLidas">("todas");

  const tiposDisponiveis = Array.from(
    new Set(
      notificacoes
        .map((n) => (n.type || n.tipo || "").toString())
        .filter((v) => v && v !== "outros")
    )
  );

  const notificacoesFiltradas = notificacoes.filter((not) => {
    const tipo = (not.type || not.tipo || "outros").toString();
    if (filtroTipo !== "todos" && tipo !== filtroTipo) return false;
    if (filtroStatus === "lidas" && !not.lida) return false;
    if (filtroStatus === "naoLidas" && not.lida) return false;
    return true;
  });

  const handleMarcarComoLida = async (id: string) => {
    await markAsRead(id);
  };

  return (
    <>
      <Head>
        <title>Notifica��es | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Veja todas as notifica��es do seu racha, mensagens do SuperAdmin e avisos do Fut7Pro."
        />
      </Head>
      <div className="pt-20 pb-24 md:pt-6 md:pb-8 max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h1 className="text-2xl font-bold text-yellow-400">Notifica��es</h1>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="text-xs bg-yellow-400 text-black font-semibold px-3 py-1 rounded hover:bg-yellow-500 transition"
            >
              Marcar todas como lidas ({unreadCount})
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-300">Tipo:</span>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="bg-[#1f1f23] border border-gray-700 rounded px-2 py-1 text-xs text-white"
            >
              <option value="todos">Todos</option>
              {tiposDisponiveis.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-300">Status:</span>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as typeof filtroStatus)}
              className="bg-[#1f1f23] border border-gray-700 rounded px-2 py-1 text-xs text-white"
            >
              <option value="todas">Todas</option>
              <option value="naoLidas">Somente n�o lidas</option>
              <option value="lidas">Somente lidas</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="text-center text-gray-400 py-8">Carregando...</div>
          ) : isError ? (
            <div className="text-center text-red-400 py-8">
              Ocorreu um erro ao carregar as notifica��es.
              {error && <div className="text-xs text-red-300 mt-2">{error}</div>}
            </div>
          ) : notificacoesFiltradas.length === 0 ? (
            <div className="text-center text-gray-400 py-12">Nenhuma notifica��o encontrada.</div>
          ) : (
            notificacoesFiltradas.map((not) => {
              const tipo = (not.type || not.tipo || "outros").toString();
              const icon = ICONS[tipo] || ICONS["outros"];
              const dataLabel = not.data ? new Date(not.data).toLocaleString("pt-BR") : "";
              const statusLabel = not.status ?? (not.lida ? "Lida" : "Nova");

              return (
                <div
                  key={not.id}
                  className={`flex items-start gap-3 rounded-lg px-4 py-3 shadow ${
                    not.lida
                      ? "bg-[#222] text-gray-400 opacity-80"
                      : "bg-[#23272F] text-white border-l-4 border-yellow-400"
                  }`}
                >
                  <div className="mt-1">{icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-bold text-base">{not.titulo}</div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-gray-300">
                        {tipo}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-gray-300">
                        {statusLabel}
                      </span>
                    </div>
                    <div className="text-sm">{not.mensagem}</div>
                    <div className="text-xs text-gray-500 mt-2">{dataLabel}</div>
                  </div>
                  {!not.lida && (
                    <button
                      className="ml-2 px-2 py-1 text-xs rounded bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition"
                      onClick={() => handleMarcarComoLida(not.id)}
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
