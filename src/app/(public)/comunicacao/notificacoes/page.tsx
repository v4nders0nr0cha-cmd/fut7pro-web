"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaBell, FaCheck, FaPoll, FaTimes, FaUserShield } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { useAdminRoleInvites } from "@/hooks/useAdminRoleInvites";
import { usePublicNotifications } from "@/hooks/usePublicNotifications";
import type { Notificacao } from "@/types/notificacao";
import type { AdminRoleInvite, AdminRoleKey } from "@/types/admin-roles";
import { usePublicLinks } from "@/hooks/usePublicLinks";

type Kind = "aviso" | "enquete" | "cobranca";

type NotificacaoEntry = {
  notificacao: Notificacao;
  kind: Kind;
  enqueteId?: string;
};

const resolveKind = (notif: Notificacao): Kind => {
  const rawType = (notif.type || notif.tipo || "").toString().toLowerCase();
  const meta = (notif.metadata || {}) as Record<string, unknown>;
  const metaKind = (meta.kind || meta.category || meta.categoria || "").toString().toLowerCase();
  if (metaKind.includes("enquete") || metaKind.includes("poll")) return "enquete";
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

const ROLE_LABELS: Record<Exclude<AdminRoleKey, "PRESIDENTE">, string> = {
  VICE_PRESIDENTE: "Vice-Presidente",
  DIRETOR_FUTEBOL: "Diretor de Futebol",
  DIRETOR_FINANCEIRO: "Diretor Financeiro",
};

const STATUS_LABELS: Record<AdminRoleInvite["status"], string> = {
  LEGACY: "Registro anterior",
  PENDING: "Aguardando sua resposta",
  ACCEPTED: "Convite aceito",
  REJECTED: "Convite recusado",
  CANCELLED: "Convite cancelado",
  EXPIRED: "Convite expirado",
  SUPERSEDED: "Convite substituído",
};

const getInviteId = (notification: Notificacao) => {
  const metadata = notification.metadata || {};
  return typeof metadata.adminRoleInviteId === "string" ? metadata.adminRoleInviteId : null;
};

const isAdminRoleInviteNotification = (notification: Notificacao) => {
  const metadata = notification.metadata || {};
  return metadata.kind === "ADMIN_ROLE_INVITE" || Boolean(getInviteId(notification));
};

export default function NotificacoesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { publicHref } = usePublicLinks();
  const { notificacoes, isLoading, isError, error, markAsRead } = usePublicNotifications({
    enabled: isAuthenticated,
  });
  const {
    invites,
    isLoading: invitesLoading,
    isError: invitesError,
    error: invitesErrorMessage,
    acceptInvite,
    rejectInvite,
  } = useAdminRoleInvites(isAuthenticated);
  const [respondingInviteId, setRespondingInviteId] = useState<string | null>(null);
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);
  const [inviteActionError, setInviteActionError] = useState<string | null>(null);

  const entries = useMemo<NotificacaoEntry[]>(() => {
    return notificacoes
      .filter((notif) => !isAdminRoleInviteNotification(notif))
      .map((notif) => ({
        notificacao: notif,
        kind: resolveKind(notif),
        enqueteId: resolveEnqueteId(notif),
      }));
  }, [notificacoes]);

  const respondToInvite = async (invite: AdminRoleInvite, action: "accept" | "reject") => {
    setRespondingInviteId(invite.id);
    setInviteFeedback(null);
    setInviteActionError(null);
    try {
      if (action === "accept") {
        await acceptInvite(invite.id);
        router.refresh();
        setInviteFeedback(
          `Convite aceito. Você agora é ${ROLE_LABELS[invite.role]} no grupo de futebol ${invite.tenantName}.`
        );
      } else {
        await rejectInvite(invite.id);
        setInviteFeedback("Convite recusado. Sua participação como atleta não foi alterada.");
      }

      const notification = notificacoes.find((item) => getInviteId(item) === invite.id);
      if (notification && !notification.lida) {
        await markAsRead(notification.id).catch(() => undefined);
      }
    } catch (err) {
      setInviteActionError(err instanceof Error ? err.message : "Não foi possível responder.");
    } finally {
      setRespondingInviteId(null);
    }
  };

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
          <h1 className="text-2xl font-bold text-brand mb-2">Notificações</h1>
          <p className="text-gray-300 mb-4">
            Entre para ver suas notificações e avisos importantes.
          </p>
          <button
            type="button"
            onClick={() => router.push(publicHref("/entrar"))}
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
        <FaBell /> Notificações
      </h1>
      {(invitesLoading || invites.length > 0 || invitesError) && (
        <section className="mb-6" aria-labelledby="admin-invites-title">
          <h2
            id="admin-invites-title"
            className="mb-3 flex items-center gap-2 text-lg font-bold text-brand-soft"
          >
            <FaUserShield /> Convites para administração
          </h2>

          {inviteFeedback && (
            <div className="mb-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
              {inviteFeedback}
              {inviteFeedback.startsWith("Convite aceito") && (
                <Link
                  href="/admin/selecionar-racha"
                  className="ml-2 inline-flex font-semibold text-yellow-300 underline underline-offset-2"
                >
                  Acessar painel administrativo
                </Link>
              )}
            </div>
          )}
          {inviteActionError && (
            <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {inviteActionError}
            </div>
          )}

          {invitesLoading ? (
            <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4 text-gray-400">
              Carregando convites...
            </div>
          ) : invitesError ? (
            <div className="rounded-lg border border-red-500/30 bg-zinc-900 p-4 text-sm text-red-300">
              Não foi possível consultar seus convites.
              {invitesErrorMessage && <div className="mt-1 text-xs">{invitesErrorMessage}</div>}
            </div>
          ) : (
            <div className="space-y-3">
              {invites.map((invite) => {
                const pending = invite.status === "PENDING";
                const responding = respondingInviteId === invite.id;
                return (
                  <article
                    key={invite.id}
                    className={`rounded-xl border p-4 ${
                      pending
                        ? "border-yellow-500/40 bg-yellow-500/10"
                        : "border-zinc-700 bg-zinc-900/80"
                    }`}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-yellow-300">
                          {STATUS_LABELS[invite.status]}
                        </div>
                        <h3 className="mt-1 text-base font-bold text-white">
                          Convite para {ROLE_LABELS[invite.role]}
                        </h3>
                        <p className="mt-1 text-sm text-gray-300">
                          {invite.invitedByName || "O Presidente"} convidou você para administrar o
                          grupo <strong>{invite.tenantName}</strong>.
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(invite.createdAt).toLocaleString("pt-BR")}
                      </div>
                    </div>

                    {pending && invite.expiresAt && (
                      <p className="mt-2 text-xs text-gray-400">
                        Válido até {new Date(invite.expiresAt).toLocaleString("pt-BR")}.
                      </p>
                    )}

                    {pending && (
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          disabled={responding}
                          onClick={() => respondToInvite(invite, "accept")}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-300 disabled:opacity-60"
                        >
                          <FaCheck /> {responding ? "Processando..." : "Aceitar convite"}
                        </button>
                        <button
                          type="button"
                          disabled={responding}
                          onClick={() => respondToInvite(invite, "reject")}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-600 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 disabled:opacity-60"
                        >
                          <FaTimes /> Rejeitar convite
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
      <div className="flex flex-col gap-5">
        {isLoading ? (
          <div className="text-center text-gray-400">Carregando...</div>
        ) : isError ? (
          <div className="text-center text-red-400">
            Falha ao carregar notificações.
            {error && <div className="text-xs text-red-300 mt-2">{String(error)}</div>}
          </div>
        ) : entries.length === 0 && invites.length === 0 ? (
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
