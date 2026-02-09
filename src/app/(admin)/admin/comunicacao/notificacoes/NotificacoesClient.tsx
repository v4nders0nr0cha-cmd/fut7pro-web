"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaBell,
  FaCheckCircle,
  FaClock,
  FaInfoCircle,
  FaPaperPlane,
  FaUserPlus,
} from "react-icons/fa";
import {
  type AdminNotificationItem,
  type AdminNotificationType,
  useAdminNotifications,
} from "@/hooks/useAdminNotifications";

type StatusFilter = "ALL" | "UNREAD" | "READ";
type TypeFilter = "ALL" | AdminNotificationType;

const typeLabels: Record<TypeFilter, string> = {
  ALL: "Todos os tipos",
  SUGGESTION_RECEIVED: "Sugestões",
  SUGGESTION_UPDATED: "Atualizações de sugestões",
  MESSAGE_RECEIVED: "Mensagens",
  ATHLETE_REQUEST_PENDING: "Solicitações",
  SYSTEM_ANNOUNCEMENT: "Sistema",
};

const typeStyles: Record<AdminNotificationType, { icon: JSX.Element; chip: string }> = {
  SUGGESTION_RECEIVED: {
    icon: <FaPaperPlane className="text-yellow-300" />,
    chip: "bg-yellow-900/50 text-yellow-200 border-yellow-700/40",
  },
  SUGGESTION_UPDATED: {
    icon: <FaCheckCircle className="text-emerald-300" />,
    chip: "bg-emerald-900/50 text-emerald-200 border-emerald-700/40",
  },
  MESSAGE_RECEIVED: {
    icon: <FaBell className="text-blue-300" />,
    chip: "bg-blue-900/50 text-blue-200 border-blue-700/40",
  },
  ATHLETE_REQUEST_PENDING: {
    icon: <FaUserPlus className="text-orange-300" />,
    chip: "bg-orange-900/50 text-orange-200 border-orange-700/40",
  },
  SYSTEM_ANNOUNCEMENT: {
    icon: <FaInfoCircle className="text-sky-300" />,
    chip: "bg-sky-900/50 text-sky-200 border-sky-700/40",
  },
};

function formatDate(value?: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR");
}

export default function NotificacoesClient() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const unreadParam =
    statusFilter === "UNREAD" ? true : statusFilter === "READ" ? false : undefined;
  const typeParam = typeFilter === "ALL" ? undefined : typeFilter;

  const { notifications, unreadCount, isLoading, isError, error, markAsRead, markAllAsRead } =
    useAdminNotifications({
      unread: unreadParam,
      type: typeParam,
      page: 1,
      limit: 80,
      refreshInterval: 30000,
    });

  const visibleNotifications = useMemo(() => notifications, [notifications]);

  const openNotification = async (notification: AdminNotificationItem) => {
    if (!notification.isRead) {
      setProcessingId(notification.id);
      try {
        await markAsRead(notification.id);
      } catch (err) {
        setFeedback(err instanceof Error ? err.message : "Falha ao marcar notificação como lida.");
      } finally {
        setProcessingId(null);
      }
    }

    if (notification.href) {
      router.push(notification.href);
    }
  };

  const handleReadAll = async () => {
    setProcessingId("__all__");
    setFeedback(null);
    try {
      const result = await markAllAsRead();
      const updatedCount =
        typeof result?.updatedCount === "number"
          ? result.updatedCount
          : Number(result?.updatedCount || 0);
      if (updatedCount > 0) {
        setFeedback(`${updatedCount} notificação(ões) marcada(s) como lida(s).`);
      } else {
        setFeedback("Não há notificações pendentes.");
      }
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Falha ao marcar notificações como lidas.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 max-w-6xl mx-auto w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">Notificações</h1>
        <button
          type="button"
          onClick={handleReadAll}
          disabled={processingId === "__all__" || unreadCount === 0}
          className="rounded bg-yellow-400 px-3 py-2 text-sm font-bold text-black transition hover:bg-yellow-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {processingId === "__all__"
            ? "Processando..."
            : `Marcar todas como lidas (${unreadCount})`}
        </button>
      </div>

      <div className="mb-5 rounded-lg bg-[#232323] border-l-4 border-yellow-400 p-4 text-sm text-zinc-200">
        <p className="font-semibold text-yellow-300">Central de notificações do seu racha.</p>
        <p className="mt-1">
          Aqui você acompanha novas sugestões, atualizações da equipe Fut7Pro e alertas importantes
          do painel. Cada ação fica salva e sincronizada para todos os admins do seu racha.
        </p>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          className="rounded border border-zinc-600 bg-[#181818] px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
        >
          <option value="ALL">Todas</option>
          <option value="UNREAD">Não lidas</option>
          <option value="READ">Lidas</option>
        </select>

        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
          className="rounded border border-zinc-600 bg-[#181818] px-3 py-2 text-sm text-zinc-100 outline-none focus:border-yellow-400"
        >
          {(Object.keys(typeLabels) as TypeFilter[]).map((type) => (
            <option key={type} value={type}>
              {typeLabels[type]}
            </option>
          ))}
        </select>

        <div className="rounded border border-zinc-700 bg-[#181818] px-3 py-2 text-sm text-zinc-300">
          <span className="font-semibold text-zinc-100">{unreadCount}</span> não lida(s)
        </div>
      </div>

      {feedback && (
        <div className="mb-4 rounded border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-200">
          {feedback}
        </div>
      )}

      {isLoading ? (
        <div className="text-center text-zinc-400 py-10">Carregando notificações...</div>
      ) : isError ? (
        <div className="rounded border border-red-700 bg-red-900/30 px-3 py-2 text-sm text-red-200">
          Falha ao carregar notificações.
          {error?.message ? <div className="text-xs text-red-300 mt-1">{error.message}</div> : null}
        </div>
      ) : visibleNotifications.length === 0 ? (
        <div className="rounded border border-zinc-700 bg-[#181818] p-4 text-sm text-zinc-400">
          Nenhuma notificação encontrada para este filtro.
        </div>
      ) : (
        <div className="space-y-3">
          {visibleNotifications.map((notification) => {
            const typeUi = typeStyles[notification.type];
            return (
              <article
                key={notification.id}
                className={`rounded-lg border p-4 transition ${
                  notification.isRead
                    ? "border-zinc-800 bg-[#181818] opacity-80"
                    : "border-yellow-700/40 bg-[#202020]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{typeUi.icon}</div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm md:text-base font-semibold text-zinc-100">
                          {notification.title}
                        </h2>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${typeUi.chip}`}
                        >
                          {typeLabels[notification.type]}
                        </span>
                        {!notification.isRead && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-900/40 px-2 py-0.5 text-[11px] font-semibold text-yellow-200">
                            <FaClock /> Nova
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-zinc-200">{notification.body}</p>
                      <p className="mt-2 text-xs text-zinc-500">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {notification.href && (
                      <button
                        type="button"
                        onClick={() => openNotification(notification)}
                        className="rounded border border-zinc-600 px-3 py-1 text-xs font-semibold text-zinc-100 hover:bg-zinc-800 transition"
                      >
                        Abrir item
                      </button>
                    )}
                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={async () => {
                          setProcessingId(notification.id);
                          try {
                            await markAsRead(notification.id);
                          } catch (err) {
                            setFeedback(
                              err instanceof Error
                                ? err.message
                                : "Falha ao marcar notificação como lida."
                            );
                          } finally {
                            setProcessingId(null);
                          }
                        }}
                        disabled={processingId === notification.id}
                        className="rounded bg-yellow-400 px-3 py-1 text-xs font-bold text-black hover:bg-yellow-300 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {processingId === notification.id ? "Processando..." : "Marcar como lida"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
