"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { FaBell, FaPoll } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notificacao } from "@/types/notificacao";
import { usePublicLinks } from "@/hooks/usePublicLinks";

type Kind = "aviso" | "enquete" | "cobranca";

type NotificacaoEntry = {
  notificacao: Notificacao;
  kind: Kind;
  enqueteId?: string;
};

const resolveKind = (notif: Notificacao): Kind => {
  const rawType = (notif.type || notif.tipo || "").toString().toLowerCase();
  if (rawType.includes("enquete") || rawType.includes("poll")) return "enquete";
  if (rawType.includes("cobranca") || rawType.includes("financeiro")) return "cobranca";
  return "aviso";
};

const resolveEnqueteId = (notif: Notificacao) => {
  const meta = (notif.metadata || {}) as Record<string, unknown>;
  const value =
    (meta.enqueteId as string | number | undefined) ||
    (meta.pollId as string | number | undefined) ||
    (notif.referenciaId as string | undefined);
  return value ? String(value) : undefined;
};

export default function NotificacoesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { publicHref } = usePublicLinks();
  const { notificacoes, isLoading, isError, error, markAsRead } = useNotifications({
    enabled: isAuthenticated,
  });

  const entries = useMemo<NotificacaoEntry[]>(() => {
    return notificacoes.map((notif) => ({
      notificacao: notif,
      kind: resolveKind(notif),
      enqueteId: resolveEnqueteId(notif),
    }));
  }, [notificacoes]);

  const handleClick = async (entry: NotificacaoEntry) => {
    const { notificacao, kind, enqueteId } = entry;
    if (!notificacao.lida) {
      await markAsRead(notificacao.id);
    }
    if (kind === "enquete" && enqueteId) {
      router.push(publicHref(`/comunicacao/enquetes/${enqueteId}`));
    }
  };

  if (authLoading) {
    return (
      <main className="max-w-3xl mx-auto px-4 pt-20 pb-24">
        <div className="text-center text-gray-400">Carregando...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="max-w-3xl mx-auto px-4 pt-20 pb-24">
        <div className="bg-[#1f1f23] rounded-xl p-6 text-center">
          <h1 className="text-2xl font-bold text-brand mb-2">Notificações do Racha</h1>
          <p className="text-gray-300 mb-4">Entre para ver notificações e avisos do seu racha.</p>
          <button
            type="button"
            onClick={() => router.push(publicHref("/login"))}
            className="bg-brand text-black font-bold px-4 py-2 rounded hover:bg-brand-strong transition"
          >
            Fazer login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 pt-20 pb-24">
      <h1 className="text-2xl font-bold text-brand mb-5 flex items-center gap-2">
        <FaBell /> Notificações do Racha
      </h1>
      <div className="flex flex-col gap-5">
        {isLoading ? (
          <div className="text-center text-gray-400">Carregando...</div>
        ) : isError ? (
          <div className="text-center text-red-400">
            Falha ao carregar notificações.
            {error && <div className="text-xs text-red-300 mt-2">{String(error)}</div>}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center text-gray-400">Nenhuma notificação encontrada.</div>
        ) : (
          entries.map((entry) => {
            const { notificacao, kind, enqueteId } = entry;
            const dataLabel = notificacao.data
              ? new Date(notificacao.data).toLocaleString("pt-BR")
              : "";
            const title = notificacao.titulo || notificacao.title || "Aviso";
            const message = notificacao.mensagem || notificacao.message || "";

            return (
              <div
                key={notificacao.id}
                className={`rounded-lg shadow-md p-4 border-l-4 transition cursor-pointer
                  ${
                    notificacao.lida
                      ? "bg-zinc-900 border-zinc-700 opacity-70"
                      : kind === "enquete"
                        ? "bg-zinc-900 border-brand animate-pulse"
                        : kind === "cobranca"
                          ? "bg-zinc-900 border-red-400"
                          : "bg-zinc-900 border-brand-strong"
                  }`}
                onClick={() => handleClick(entry)}
              >
                <div className="flex items-center gap-2 mb-2">
                  {kind === "enquete" && <FaPoll className="text-brand" />}
                  <span className="font-bold text-brand-soft">{title}</span>
                  <span className="ml-auto text-xs text-gray-400">{dataLabel}</span>
                </div>
                <div className="text-gray-200">{message}</div>
                {!notificacao.lida && kind === "enquete" && enqueteId && (
                  <button
                    type="button"
                    className="mt-2 bg-brand hover:bg-brand-strong text-black font-bold px-4 py-1 rounded text-xs"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleClick(entry);
                    }}
                  >
                    Responder
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
