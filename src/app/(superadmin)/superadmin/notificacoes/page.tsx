"use client";

import { useMemo, useState } from "react";
import Head from "next/head";
import { FaEye, FaTrash, FaRedo, FaPlus } from "react-icons/fa";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationTemplates } from "@/hooks/useNotificationTemplates";
import { ModalNovaNotificacao } from "@/components/superadmin/ModalNovaNotificacao";
import { ModalNotificacaoPreview } from "@/components/superadmin/ModalNotificacaoPreview";
import type { CreateNotificationInput, NotificationType, Notificacao } from "@/types/notificacao";
import { NOTIFICATION_CHANNEL_LABELS } from "@/constants/notification-templates";

const TIPOS: NotificationType[] = ["ALERTA", "SISTEMA", "PERSONALIZADA"];

export default function SuperAdminNotificacoesPage() {
  const {
    notificacoes,
    isLoading,
    isValidating,
    error,
    createNotification,
    deleteNotificacao,
    markAllAsRead,
    markAsRead,
  } = useNotifications({ filters: { limit: 200 } });
  const { findTemplate } = useNotificationTemplates();

  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState<"todos" | NotificationType>("todos");
  const [apenasNaoLidas, setApenasNaoLidas] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [notificacaoPreview, setNotificacaoPreview] = useState<Notificacao | null>(null);

  const notificacoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return notificacoes.filter((notificacao) => {
      const matchesSearch =
        termo.length === 0 ||
        notificacao.title.toLowerCase().includes(termo) ||
        notificacao.message.toLowerCase().includes(termo);
      const matchesType = tipo === "todos" || notificacao.type === tipo;
      const matchesRead = !apenasNaoLidas || !notificacao.isRead;
      return matchesSearch && matchesType && matchesRead;
    });
  }, [notificacoes, busca, tipo, apenasNaoLidas]);

  const handleNovaNotificacao = async (payload: CreateNotificationInput) => {
    await createNotification(payload);
  };

  const handleExcluir = async (id: string) => {
    await deleteNotificacao(id);
  };

  const handleReenviar = async (notificacao: Notificacao) => {
    await createNotification({
      title: notificacao.title,
      message: notificacao.message,
      type: notificacao.type,
      metadata: notificacao.metadata,
    });
  };

  return (
    <>
      <Head>
        <title>Notificações - Fut7Pro SuperAdmin</title>
        <meta
          name="description"
          content="Controle e envie notificações em massa para os administradores dos rachas Fut7Pro."
        />
      </Head>
      <div className="px-4 py-6 md:px-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">
            Notificações e Mensagens
          </h1>
          <div className="flex flex-wrap gap-2">
            <button
              className="flex items-center gap-2 bg-zinc-700 text-zinc-100 font-semibold px-4 py-2 rounded-xl hover:bg-zinc-600 transition disabled:opacity-60"
              onClick={async () => {
                try {
                  await markAllAsRead();
                } catch (err) {
                  if (process.env.NODE_ENV === "development") {
                    console.warn("Falha ao marcar todas as notificações como lidas:", err);
                  }
                }
              }}
              disabled={isLoading}
            >
              Marcar todas como lidas
            </button>
            <button
              className="flex items-center gap-2 bg-yellow-400 text-zinc-900 font-semibold px-4 py-2 rounded-xl hover:bg-yellow-300 transition"
              onClick={() => setModalAberto(true)}
              aria-label="Nova Notificação"
            >
              <FaPlus /> Nova Notificação
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <input
            className="w-full md:w-1/3 px-3 py-2 rounded bg-zinc-800 text-zinc-100 border border-zinc-700 focus:outline-none"
            placeholder="Buscar por título ou mensagem"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar mensagem"
          />
          <select
            className="bg-zinc-800 text-zinc-100 rounded px-3 py-2 border border-zinc-700"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as "todos" | NotificationType)}
            aria-label="Filtrar tipo"
          >
            <option value="todos">Tipo: todos</option>
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={apenasNaoLidas}
              onChange={(e) => setApenasNaoLidas(e.target.checked)}
            />
            Somente não lidas
          </label>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-500 bg-red-900/30 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-xl shadow-lg bg-zinc-900">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-2 py-3">Tipo</th>
                <th className="px-2 py-3">Canais</th>
                <th className="px-2 py-3">Template</th>
                <th className="px-2 py-3">Data/Hora</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-2 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-zinc-500">
                    Carregando notificações...
                  </td>
                </tr>
              ) : isValidating && notificacoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-zinc-500">
                    Atualizando notificações...
                  </td>
                </tr>
              ) : notificacoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-zinc-500">
                    Nenhuma notificação encontrada.
                  </td>
                </tr>
              ) : (
                notificacoesFiltradas.map((n) => {
                  const channelList = n.metadata?.channels ?? [];
                  const templateName = n.metadata?.templateId
                    ? (findTemplate(n.metadata.templateId)?.name ?? "-")
                    : "-";
                  return (
                    <tr key={n.id} className="hover:bg-zinc-800">
                      <td className="px-4 py-3 max-w-xs truncate">
                        <button
                          onClick={() => setNotificacaoPreview(n)}
                          className="hover:underline text-yellow-400"
                        >
                          {n.title}
                        </button>
                      </td>
                      <td className="px-2 py-3">{n.type}</td>
                      <td className="px-2 py-3">
                        {channelList.length === 0 ? (
                          <span className="text-xs text-zinc-500">In-app</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {channelList.map((channel) => (
                              <span
                                key={channel}
                                className="px-2 py-0.5 rounded-full bg-zinc-700 text-[10px] uppercase tracking-wide text-zinc-200"
                              >
                                {NOTIFICATION_CHANNEL_LABELS[channel]}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-3 text-sm text-zinc-300">{templateName}</td>
                      <td className="px-2 py-3">{new Date(n.createdAt).toLocaleString("pt-BR")}</td>
                      <td className="px-2 py-3">
                        {n.isRead ? (
                          <span className="text-green-400 font-semibold">Lida</span>
                        ) : (
                          <button
                            className="text-yellow-300 hover:underline"
                            onClick={() => markAsRead(n.id)}
                          >
                            Marcar como lida
                          </button>
                        )}
                      </td>
                      <td className="px-2 py-3 flex gap-2">
                        <button
                          onClick={() => setNotificacaoPreview(n)}
                          aria-label="Ver mensagem"
                          title="Ver mensagem"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleReenviar(n)}
                          aria-label="Reenviar"
                          title="Reenviar"
                        >
                          <FaRedo />
                        </button>
                        <button
                          onClick={() => handleExcluir(n.id)}
                          aria-label="Excluir"
                          title="Excluir"
                          className="text-red-500"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {modalAberto && (
          <ModalNovaNotificacao
            onClose={() => setModalAberto(false)}
            onSubmit={handleNovaNotificacao}
          />
        )}
        {notificacaoPreview && (
          <ModalNotificacaoPreview
            notificacao={notificacaoPreview}
            onClose={() => setNotificacaoPreview(null)}
          />
        )}
      </div>
    </>
  );
}
