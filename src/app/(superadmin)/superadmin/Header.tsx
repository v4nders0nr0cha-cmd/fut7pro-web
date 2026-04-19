"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  FaBell,
  FaChevronDown,
  FaRegDotCircle,
  FaShieldAlt,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";
import { signOut, useSession } from "next-auth/react";
import { Fut7ConfirmDialog } from "@/components/ui/feedback";

type HeaderNotificationItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  createdAt: string;
  tone: "critical" | "warning" | "info";
};

type AdminSupportListResponse = {
  results?: Array<{
    id: string;
    subject: string;
    status: "OPEN" | "IN_PROGRESS" | "WAITING_ADMIN" | "RESOLVED" | "CLOSED";
    lastMessageAt: string;
    tenant?: {
      name: string;
      slug: string;
    } | null;
  }>;
};

type AmbassadorSupportListResponse = {
  tickets?: Array<{
    id: string;
    title: string;
    status: "ABERTO" | "EM_ANALISE" | "AGUARDANDO_RETORNO_EMBAIXADOR" | "RESOLVIDO" | "ENCERRADO";
    influencerName: string;
    influencerCoupon: string;
    lastMessageAt: string;
  }>;
};

type CampaignListResponse = {
  campaigns?: Array<{
    id: string;
    title: string;
    status: "PENDING" | "SENT" | "ERROR" | "CANCELED";
    createdAt?: string | null;
  }>;
  results?: Array<{
    id: string;
    title: string;
    status: "PENDING" | "SENT" | "ERROR" | "CANCELED";
    createdAt?: string | null;
  }>;
};

function formatRelativeDate(value?: string | null): string {
  if (!value) return "agora";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "agora";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<HeaderNotificationItem[]>([]);
  const [notificationsBadge, setNotificationsBadge] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!session?.user) return;
    setNotificationsLoading(true);
    setNotificationsError(null);

    try {
      const [adminResponse, ambassadorResponse, campaignsResponse] = await Promise.all([
        fetch("/api/superadmin/support/tickets?limit=30&page=1", { cache: "no-store" }),
        fetch("/api/superadmin/embaixadores/support/tickets", { cache: "no-store" }),
        fetch("/api/superadmin/notificacoes?limit=20", { cache: "no-store" }),
      ]);

      if (!adminResponse.ok || !ambassadorResponse.ok || !campaignsResponse.ok) {
        throw new Error("Falha ao carregar alertas operacionais.");
      }

      const adminPayload = (await adminResponse
        .json()
        .catch(() => ({}))) as AdminSupportListResponse;
      const ambassadorPayload = (await ambassadorResponse
        .json()
        .catch(() => ({}))) as AmbassadorSupportListResponse;
      const campaignsPayload = (await campaignsResponse.json().catch(() => ({}))) as
        | CampaignListResponse
        | Array<{
            id: string;
            title: string;
            status: "PENDING" | "SENT" | "ERROR" | "CANCELED";
            createdAt?: string | null;
          }>;

      const adminTickets = Array.isArray(adminPayload.results) ? adminPayload.results : [];
      const ambassadorTickets = Array.isArray(ambassadorPayload.tickets)
        ? ambassadorPayload.tickets
        : [];
      const campaigns = Array.isArray(campaignsPayload)
        ? campaignsPayload
        : Array.isArray(campaignsPayload.campaigns)
          ? campaignsPayload.campaigns
          : Array.isArray(campaignsPayload.results)
            ? campaignsPayload.results
            : [];

      const adminPending = adminTickets.filter(
        (ticket) => ticket.status !== "RESOLVED" && ticket.status !== "CLOSED"
      );
      const ambassadorPending = ambassadorTickets.filter(
        (ticket) => ticket.status !== "RESOLVIDO" && ticket.status !== "ENCERRADO"
      );
      const campaignAlerts = campaigns.filter(
        (campaign) => campaign.status === "ERROR" || campaign.status === "PENDING"
      );

      const nextItems: HeaderNotificationItem[] = [
        ...adminPending.slice(0, 4).map((ticket) => ({
          id: `admin-${ticket.id}`,
          title: "Novo chamado de admin do racha",
          description: `${ticket.subject} • ${ticket.tenant?.name || ticket.tenant?.slug || "Racha"}`,
          href: "/superadmin/suporte",
          createdAt: ticket.lastMessageAt,
          tone: (ticket.status === "OPEN" ? "warning" : "info") as "warning" | "info",
        })),
        ...ambassadorPending.slice(0, 4).map((ticket) => ({
          id: `amb-${ticket.id}`,
          title: "Chamado de embaixador pendente",
          description: `${ticket.title} • ${ticket.influencerName}${ticket.influencerCoupon ? ` (${ticket.influencerCoupon})` : ""}`,
          href: "/superadmin/suporte",
          createdAt: ticket.lastMessageAt,
          tone: (ticket.status === "ABERTO" ? "warning" : "info") as "warning" | "info",
        })),
        ...campaignAlerts.slice(0, 4).map((campaign) => ({
          id: `campaign-${campaign.id}`,
          title:
            campaign.status === "ERROR"
              ? "Campanha com erro de entrega"
              : "Campanha pendente de processamento",
          description: campaign.title,
          href: "/superadmin/notificacoes",
          createdAt: campaign.createdAt || new Date().toISOString(),
          tone: (campaign.status === "ERROR" ? "critical" : "warning") as "critical" | "warning",
        })),
      ]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8);

      setNotificationsBadge(adminPending.length + ambassadorPending.length + campaignAlerts.length);
      setNotifications(nextItems);
    } catch (error) {
      setNotificationsError(
        error instanceof Error ? error.message : "Falha ao carregar notificações do header."
      );
    } finally {
      setNotificationsLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current) return;
      if (menuRef.current.contains(event.target as Node)) return;
      if (notificationsRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
      setNotificationsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    void loadNotifications();
    const interval = setInterval(() => {
      void loadNotifications();
    }, 60_000);

    return () => clearInterval(interval);
  }, [loadNotifications, session?.user]);

  useEffect(() => {
    if (!notificationsOpen) return;
    void loadNotifications();
  }, [loadNotifications, notificationsOpen]);

  async function handleLogout() {
    setLogoutConfirmOpen(true);
  }

  async function confirmLogout() {
    setLogoutConfirmOpen(false);
    setMenuOpen(false);
    try {
      await fetch("/api/superadmin/logout", {
        method: "POST",
        cache: "no-store",
      });
    } catch {
      // Em caso de falha no backend, finaliza sessao local de qualquer forma.
    }
    await (signOut as any)({
      basePath: "/api/superadmin-auth",
      callbackUrl: "/superadmin/login",
    });
  }

  const notificationBadgeLabel = useMemo(() => {
    if (notificationsBadge <= 0) return null;
    if (notificationsBadge > 99) return "99+";
    return String(notificationsBadge);
  }, [notificationsBadge]);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center border-b border-zinc-800 bg-zinc-950/95 px-4 shadow-sm backdrop-blur sm:px-6">
      <div className="flex w-full items-center justify-between gap-3">
        <span className="text-lg font-bold tracking-wide text-yellow-400 sm:text-xl">
          Painel SuperAdmin
        </span>
        <div className="relative flex items-center gap-2 sm:gap-3">
          {session?.user ? (
            <>
              <div ref={notificationsRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen((open) => !open);
                    setMenuOpen(false);
                  }}
                  className="relative rounded-lg border border-zinc-700 bg-zinc-900 p-2.5 text-zinc-100 transition hover:border-yellow-400 hover:text-yellow-300"
                  aria-haspopup="menu"
                  aria-expanded={notificationsOpen}
                  aria-label="Abrir notificações operacionais"
                >
                  <FaBell size={15} />
                  {notificationBadgeLabel ? (
                    <span className="absolute -right-1.5 -top-1.5 min-w-[18px] rounded-full bg-yellow-400 px-1.5 text-center text-[10px] font-bold text-black">
                      {notificationBadgeLabel}
                    </span>
                  ) : null}
                </button>

                {notificationsOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-14 z-50 w-[340px] max-w-[92vw] rounded-xl border border-zinc-700 bg-zinc-900 p-2 shadow-2xl"
                  >
                    <div className="mb-2 flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-zinc-400">
                          Alertas operacionais
                        </p>
                        <p className="text-sm font-semibold text-zinc-100">
                          Central de suporte e campanhas
                        </p>
                      </div>
                      <Link
                        href="/superadmin/notificacoes"
                        onClick={() => setNotificationsOpen(false)}
                        className="text-xs font-semibold text-yellow-300 hover:text-yellow-200"
                      >
                        Ver tudo
                      </Link>
                    </div>

                    {notificationsLoading ? (
                      <p className="rounded-lg px-3 py-5 text-sm text-zinc-400">
                        Carregando notificações...
                      </p>
                    ) : notificationsError ? (
                      <p className="rounded-lg px-3 py-5 text-sm text-red-300">
                        {notificationsError}
                      </p>
                    ) : notifications.length === 0 ? (
                      <p className="rounded-lg px-3 py-5 text-sm text-zinc-400">
                        Sem alertas pendentes no momento.
                      </p>
                    ) : (
                      <div className="max-h-[360px] space-y-2 overflow-auto pr-1">
                        {notifications.map((item) => (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={() => setNotificationsOpen(false)}
                            className="block rounded-lg border border-zinc-700 bg-zinc-950/70 px-3 py-2 transition hover:border-zinc-500 hover:bg-zinc-900"
                          >
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-zinc-100">{item.title}</p>
                              <FaRegDotCircle
                                size={10}
                                className={
                                  item.tone === "critical"
                                    ? "text-red-300"
                                    : item.tone === "warning"
                                      ? "text-yellow-300"
                                      : "text-sky-300"
                                }
                              />
                            </div>
                            <p className="text-xs text-zinc-300">{item.description}</p>
                            <p className="mt-1 text-[11px] text-zinc-500">
                              {formatRelativeDate(item.createdAt)}
                            </p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen((open) => !open);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-left transition hover:border-zinc-500"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-label="Menu da conta SuperAdmin"
                >
                  <FaUserCircle size={22} className="text-yellow-400" />
                  <span className="max-w-[200px] truncate text-sm font-semibold sm:text-base">
                    {session.user.name || session.user.email || "SuperAdmin"}
                  </span>
                  <FaChevronDown className="text-zinc-300" size={12} />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-14 z-50 min-w-[260px] rounded-xl border border-zinc-700 bg-zinc-900 p-2 shadow-2xl"
                  >
                    <div className="mb-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2">
                      <p className="text-xs uppercase tracking-wide text-zinc-400">Sessao ativa</p>
                      <p className="truncate text-sm font-semibold text-zinc-100">
                        {session.user.name || "SuperAdmin"}
                      </p>
                      {session.user.email ? (
                        <p className="truncate text-xs text-zinc-400">{session.user.email}</p>
                      ) : null}
                    </div>

                    <Link
                      href="/superadmin/config"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
                    >
                      <FaUserCircle size={14} />
                      Meu perfil
                    </Link>

                    <Link
                      href="/superadmin/config#seguranca"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
                    >
                      <FaShieldAlt size={14} />
                      Seguranca
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-950/60"
                    >
                      <FaSignOutAlt size={14} />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <FaUserCircle size={24} className="text-zinc-300" />
          )}
        </div>
      </div>
      <Fut7ConfirmDialog
        open={logoutConfirmOpen}
        title="Encerrar sessão do SuperAdmin?"
        eyebrow="Sessão administrativa"
        description="Você sairá do painel SuperAdmin neste navegador e precisará autenticar novamente para voltar."
        confirmLabel="Encerrar sessão"
        cancelLabel="Continuar no painel"
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={() => void confirmLogout()}
      />
    </header>
  );
}
