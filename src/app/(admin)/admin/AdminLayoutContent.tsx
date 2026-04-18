"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomMenuAdmin from "@/components/layout/BottomMenuAdmin";
import { NotificationProvider } from "@/context/NotificationContext";
import ToastGlobal from "@/components/ui/ToastGlobal";
import { useRacha } from "@/context/RachaContext";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { type AdminNotificationItem, useAdminNotifications } from "@/hooks/useAdminNotifications";
import { useSessionRefreshScheduler } from "@/hooks/useSessionRefreshScheduler";
import AccessCompensationGrantedModal from "@/components/admin/AccessCompensationGrantedModal";
import PainelAdminBloqueado from "./PainelAdminBloqueado";
import { signOut, useSession } from "next-auth/react";

const LAST_TENANT_STORAGE = "fut7pro_last_tenants";
const PERF_FLAG_KEY = "fut7pro_admin_perf_enabled";
const PERF_START_KEY = "fut7pro_admin_perf_start";

const clearActiveTenantCookie = () => {
  if (typeof window === "undefined") return;
  fetch("/api/admin/active-tenant", { method: "DELETE" }).catch(() => {
    // ignore
  });
};

const trackLastTenantAccess = (slug: string) => {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(LAST_TENANT_STORAGE);
    const data = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    data[slug] = Date.now();
    window.localStorage.setItem(LAST_TENANT_STORAGE, JSON.stringify(data));
  } catch {
    // ignore
  }
};

function AdminLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181818] to-[#232323] text-white">
      <div className="text-center space-y-2">
        <div className="h-10 w-10 mx-auto rounded-full border-2 border-yellow-400/40 border-t-yellow-400 animate-spin" />
        <p className="text-sm text-gray-300">Carregando painel...</p>
      </div>
    </div>
  );
}

function SessionRecoveryNotice({
  open,
  errorMessage,
  onSignInAgain,
}: {
  open: boolean;
  errorMessage: string | null;
  onSignInAgain: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[80] w-full max-w-sm px-3 sm:px-0">
      <div className="rounded-xl border border-yellow-500/45 bg-[#171717]/95 px-4 py-3 text-white shadow-[0_16px_56px_-28px_rgba(251,191,36,0.45)]">
        <h2 className="text-sm font-bold text-yellow-300">Reconectando sua sessão em segundo plano</h2>
        <p className="mt-1 text-xs text-zinc-200">
          O painel continua aberto. Se necessário, entre novamente sem perder sua edição atual.
        </p>
        {errorMessage ? <p className="mt-2 text-xs text-red-300">{errorMessage}</p> : null}
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/15"
            onClick={onSignInAgain}
          >
            Entrar novamente
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayoutContent({ children }: { children: ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [tenantResolutionError, setTenantResolutionError] = useState(false);
  const [sessionExpiredModalOpen, setSessionExpiredModalOpen] = useState(false);
  const [sessionModalError, setSessionModalError] = useState<string | null>(null);
  const [compensationModalOpen, setCompensationModalOpen] = useState(false);
  const [compensationModalProcessing, setCompensationModalProcessing] = useState(false);
  const [activeCompensationNotification, setActiveCompensationNotification] =
    useState<AdminNotificationItem | null>(null);
  const [loadingTimeoutReached, setLoadingTimeoutReached] = useState(false);
  const [tenantBootstrapped, setTenantBootstrapped] = useState(false);
  const [criticalFlowDirty, setCriticalFlowDirty] = useState(false);
  const { data: session, status: sessionStatus, update: updateSession } = useSession();
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const { tenantSlug, rachaId, setTenantSlug, setRachaId } = useRacha();
  const {
    access,
    isLoading: accessLoading,
    error: accessError,
    mutate: mutateAccess,
  } = useAdminAccess({ tenantSlug });
  const perfLoggedRef = useRef(false);
  const tokenErrorHandledRef = useRef(false);
  const unauthorizedRetryCountRef = useRef(0);
  const unauthenticatedRecoveryInFlightRef = useRef(false);
  const unauthenticatedRecoveryAttemptCountRef = useRef(0);
  const unauthenticatedRecoveryTimerRef = useRef<number | null>(null);
  const compensationModalTimerRef = useRef<number | null>(null);
  const shownCompensationNotificationIdsRef = useRef<Set<string>>(new Set());
  const tokenError = String((session?.user as any)?.tokenError || "").trim();
  const shouldForceSignOutForTokenError =
    tokenError.length > 0 && tokenError !== "RefreshAccessTokenRetry";
  const accessErrorStatus = (accessError as { status?: number } | undefined)?.status;
  const isRecoverableAccessError =
    accessErrorStatus === 401 ||
    accessErrorStatus === 408 ||
    accessErrorStatus === 429 ||
    (typeof accessErrorStatus === "number" && accessErrorStatus >= 500);

  const isStatusRoute = useMemo(() => pathname.startsWith("/admin/status-assinatura"), [pathname]);
  const isBillingRoute = useMemo(
    () => pathname.startsWith("/admin/financeiro/planos-limites"),
    [pathname]
  );
  const isHubRoute = useMemo(() => pathname.startsWith("/admin/selecionar-racha"), [pathname]);
  const isAllowedWhenBlocked = isStatusRoute || isBillingRoute;
  const hasTenantContext = Boolean(tenantSlug?.trim() && rachaId?.trim());
  const hasResolvedTenant = Boolean(access?.tenant?.slug && access?.tenant?.id);
  const hasStableTenantContext = hasResolvedTenant || hasTenantContext || tenantBootstrapped;
  const shouldBlockForPermissionBootstrap =
    accessLoading && !hasStableTenantContext && !criticalFlowDirty;
  const shouldEnableCompensationModalQuery =
    hasResolvedTenant &&
    !accessLoading &&
    !access?.blocked &&
    sessionStatus === "authenticated";

  const {
    notifications: compensationNotifications,
    markAsRead: markCompensationNotificationAsRead,
  } = useAdminNotifications({
    enabled: shouldEnableCompensationModalQuery,
    includeCount: false,
    unread: true,
    type: "ACCESS_COMPENSATION_GRANTED",
    page: 1,
    limit: 1,
    refreshInterval: 45000,
  });

  const latestCompensationNotification = compensationNotifications[0] ?? null;

  const openSessionExpiredModal = useCallback((message?: string) => {
    setSessionModalError(message ?? null);
    setSessionExpiredModalOpen(true);
  }, []);

  const buildAdminLoginHref = useCallback(() => {
    const returnTo = pathname && pathname !== "/admin/login" ? pathname : "/admin/dashboard";
    return `/admin/login?expired=1&returnTo=${encodeURIComponent(returnTo)}`;
  }, [pathname]);

  useSessionRefreshScheduler({
    status: sessionStatus,
    session: session as any,
    refreshSession: updateSession as any,
    enabled: sessionStatus === "authenticated",
    maxRetries: 8,
    refreshLeadMs: 180_000,
    fallbackIntervalMs: 60_000,
    heartbeatIntervalMs: 55_000,
    activityThrottleMs: 20_000,
    onRefreshSuccess: () => {
      unauthorizedRetryCountRef.current = 0;
      tokenErrorHandledRef.current = false;
      unauthenticatedRecoveryAttemptCountRef.current = 0;
      setSessionExpiredModalOpen(false);
      setSessionModalError(null);
    },
    onRefreshFailed: () => {
      openSessionExpiredModal("A sessão está oscilando. Tentando reconectar automaticamente.");
    },
  });

  useEffect(() => {
    if (!shouldForceSignOutForTokenError || tokenErrorHandledRef.current) return;
    tokenErrorHandledRef.current = true;
    openSessionExpiredModal("Detectamos instabilidade de autenticação e iniciamos reconexão.");
  }, [shouldForceSignOutForTokenError, openSessionExpiredModal]);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    if (shouldForceSignOutForTokenError) return;
    setSessionExpiredModalOpen(false);
    setSessionModalError(null);
  }, [sessionStatus, shouldForceSignOutForTokenError]);

  useEffect(() => {
    if (sessionStatus !== "unauthenticated") {
      unauthenticatedRecoveryInFlightRef.current = false;
      unauthenticatedRecoveryAttemptCountRef.current = 0;
      if (unauthenticatedRecoveryTimerRef.current) {
        window.clearTimeout(unauthenticatedRecoveryTimerRef.current);
        unauthenticatedRecoveryTimerRef.current = null;
      }
      return;
    }

    if (unauthenticatedRecoveryInFlightRef.current) {
      return;
    }

    if (unauthenticatedRecoveryTimerRef.current) {
      window.clearTimeout(unauthenticatedRecoveryTimerRef.current);
    }

    const ATTEMPT_DELAYS = [350, 900, 1800, 3200, 5500, 8000, 12000];
    const MAX_ATTEMPTS = 20;

    const runAttempt = async () => {
      if (unauthenticatedRecoveryAttemptCountRef.current >= MAX_ATTEMPTS) {
        openSessionExpiredModal(
          "Não foi possível reconectar automaticamente. Use 'Entrar novamente' quando estiver pronto."
        );
        unauthenticatedRecoveryInFlightRef.current = false;
        return;
      }

      unauthenticatedRecoveryInFlightRef.current = true;
      unauthenticatedRecoveryAttemptCountRef.current += 1;

      try {
        const nextSession = await updateSession();
        const nextTokenError = String((nextSession?.user as any)?.tokenError || "").trim();
        if (nextSession?.user && !nextTokenError) {
          unauthorizedRetryCountRef.current = 0;
          tokenErrorHandledRef.current = false;
          unauthenticatedRecoveryAttemptCountRef.current = 0;
          unauthenticatedRecoveryInFlightRef.current = false;
          setSessionExpiredModalOpen(false);
          setSessionModalError(null);
          await mutateAccess();
          return;
        }
      } catch {
        // keep retry loop active
      }

      const attemptIdx = unauthenticatedRecoveryAttemptCountRef.current - 1;
      const nextDelay = ATTEMPT_DELAYS[Math.min(attemptIdx, ATTEMPT_DELAYS.length - 1)] ?? 12000;
      openSessionExpiredModal(
        "Reconectando sessão automaticamente. Você pode continuar editando enquanto isso."
      );
      unauthenticatedRecoveryInFlightRef.current = false;
      unauthenticatedRecoveryTimerRef.current = window.setTimeout(() => {
        void runAttempt();
      }, nextDelay);
    };

    void runAttempt();

    return () => {
      if (unauthenticatedRecoveryTimerRef.current) {
        window.clearTimeout(unauthenticatedRecoveryTimerRef.current);
        unauthenticatedRecoveryTimerRef.current = null;
      }
      unauthenticatedRecoveryInFlightRef.current = false;
    };
  }, [mutateAccess, openSessionExpiredModal, sessionStatus, updateSession]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const readDirtyFlag = () => {
      setCriticalFlowDirty(Boolean((window as any).__FUT7PRO_ADMIN_FLOW_DIRTY__));
    };
    readDirtyFlag();
    const onDirty = (event: Event) => {
      const detail = (event as CustomEvent<{ dirty?: boolean }>).detail;
      if (typeof detail?.dirty === "boolean") {
        setCriticalFlowDirty(detail.dirty);
        return;
      }
      readDirtyFlag();
    };
    window.addEventListener("fut7pro:admin-flow-dirty", onDirty as EventListener);
    return () => {
      window.removeEventListener("fut7pro:admin-flow-dirty", onDirty as EventListener);
    };
  }, []);

  useEffect(() => {
    if (hasResolvedTenant || hasTenantContext) {
      setTenantBootstrapped(true);
    }
  }, [hasResolvedTenant, hasTenantContext]);

  useEffect(() => {
    if (accessLoading || !access?.tenant) return;
    const nextSlug = access.tenant.slug?.trim() || "";
    const nextId = access.tenant.id?.trim() || "";
    if (nextSlug && nextSlug !== tenantSlug) {
      setTenantSlug(nextSlug);
    }
    if (nextId && nextId !== rachaId) {
      setRachaId(nextId);
    }
    if (nextSlug) {
      trackLastTenantAccess(nextSlug);
    }
  }, [accessLoading, access, tenantSlug, rachaId, setTenantSlug, setRachaId]);

  useEffect(() => {
    if (!shouldBlockForPermissionBootstrap) {
      setLoadingTimeoutReached(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setLoadingTimeoutReached(true);
    }, 15000);

    return () => window.clearTimeout(timer);
  }, [shouldBlockForPermissionBootstrap]);

  useEffect(() => {
    if (accessLoading || accessError || access?.blocked || hasResolvedTenant || isHubRoute) {
      setTenantResolutionError(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setTenantResolutionError(true);
    }, 12000);
    return () => window.clearTimeout(timer);
  }, [accessLoading, accessError, access?.blocked, hasResolvedTenant, isHubRoute]);

  useEffect(() => {
    if (accessLoading || !accessError) return;
    const status = (accessError as { status?: number } | undefined)?.status;
    if (status === 401) {
      if (sessionStatus === "authenticated" && unauthorizedRetryCountRef.current < 4) {
        unauthorizedRetryCountRef.current += 1;
        const retryDelay = 500 * unauthorizedRetryCountRef.current;
        window.setTimeout(() => {
          void (async () => {
            try {
              await updateSession();
            } catch {
              // keep retry cycle
            }
            await mutateAccess();
          })();
        }, retryDelay);
        return;
      }

      openSessionExpiredModal(
        "Falha de autenticação temporária. Vamos manter a tentativa de reconexão em segundo plano."
      );
      return;
    }

    unauthorizedRetryCountRef.current = 0;

    if (status === 408 || status === 429 || (typeof status === "number" && status >= 500)) {
      window.setTimeout(() => {
        void mutateAccess();
      }, 1500);
      return;
    }

    if (status === 400 || status === 403 || status === 404) {
      clearActiveTenantCookie();
      router.replace("/admin/selecionar-racha");
      return;
    }

    router.replace("/admin/selecionar-racha");
  }, [
    accessLoading,
    accessError,
    sessionStatus,
    mutateAccess,
    router,
    openSessionExpiredModal,
    updateSession,
  ]);

  useEffect(() => {
    if (accessLoading || !access?.blocked) return;
    if (!isAllowedWhenBlocked) {
      router.replace("/admin/status-assinatura");
    }
  }, [accessLoading, access?.blocked, isAllowedWhenBlocked, router]);

  useEffect(() => {
    if (accessLoading || !hasResolvedTenant || perfLoggedRef.current) return;
    if (typeof window === "undefined") return;
    const perfEnabled = window.sessionStorage.getItem(PERF_FLAG_KEY) === "1";
    const startRaw = window.sessionStorage.getItem(PERF_START_KEY);
    if (!perfEnabled || !startRaw) return;
    const start = Number(startRaw);
    if (Number.isFinite(start)) {
      const delta = Math.max(0, performance.now() - start);
      console.info("[Perf] dashboardReadyMs", Math.round(delta));
      window.sessionStorage.removeItem(PERF_START_KEY);
    }
    perfLoggedRef.current = true;
  }, [accessLoading, hasResolvedTenant]);

  const handleSignInAgain = () => {
    signOut({ callbackUrl: buildAdminLoginHref() });
  };

  useEffect(() => {
    if (!shouldEnableCompensationModalQuery) return;
    if (!latestCompensationNotification || compensationModalOpen) return;
    const notificationId = latestCompensationNotification.id;
    if (shownCompensationNotificationIdsRef.current.has(notificationId)) return;

    if (compensationModalTimerRef.current) {
      window.clearTimeout(compensationModalTimerRef.current);
    }

    compensationModalTimerRef.current = window.setTimeout(() => {
      shownCompensationNotificationIdsRef.current.add(notificationId);
      setActiveCompensationNotification(latestCompensationNotification);
      setCompensationModalOpen(true);
    }, 620);

    return () => {
      if (compensationModalTimerRef.current) {
        window.clearTimeout(compensationModalTimerRef.current);
        compensationModalTimerRef.current = null;
      }
    };
  }, [latestCompensationNotification, compensationModalOpen, shouldEnableCompensationModalQuery]);

  const closeCompensationModal = useCallback(
    async (navigateToDetails: boolean) => {
      const notification = activeCompensationNotification;
      if (!notification) return;

      setCompensationModalProcessing(true);
      try {
        await markCompensationNotificationAsRead(notification.id);
      } catch (error) {
        console.warn("[admin] Falha ao marcar notificação de compensação como lida", error);
      } finally {
        setCompensationModalProcessing(false);
        setCompensationModalOpen(false);
        setActiveCompensationNotification(null);
      }

      if (navigateToDetails) {
        router.push("/admin/comunicacao/notificacoes");
      }
    },
    [activeCompensationNotification, markCompensationNotificationAsRead, router]
  );

  const withSessionModal = (content: ReactNode) => (
    <>
      {content}
      <AccessCompensationGrantedModal
        open={compensationModalOpen}
        notification={activeCompensationNotification}
        processing={compensationModalProcessing}
        onDismiss={() => void closeCompensationModal(false)}
        onViewDetails={() => void closeCompensationModal(true)}
      />
      <SessionRecoveryNotice
        open={sessionExpiredModalOpen}
        errorMessage={sessionModalError}
        onSignInAgain={handleSignInAgain}
      />
    </>
  );

  if (accessError && !isRecoverableAccessError) {
    return withSessionModal(
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181818] to-[#232323] text-white px-4">
        <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <h1 className="text-xl font-bold text-red-200 mb-2">Falha ao carregar o painel</h1>
          <p className="text-sm text-zinc-200 mb-6">
            Não foi possível validar o racha ativo agora. Volte para selecionar seu racha ou saia da
            conta.
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="rounded-lg bg-yellow-400 text-black font-semibold px-4 py-2"
              onClick={() => router.replace("/admin/selecionar-racha")}
            >
              Voltar para selecionar racha
            </button>
            <button
              type="button"
              className="rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 font-semibold px-4 py-2"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
            >
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loadingTimeoutReached && !access && !hasStableTenantContext && !criticalFlowDirty) {
    return withSessionModal(
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181818] to-[#232323] text-white px-4">
        <div className="max-w-md w-full rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6 text-center">
          <h1 className="text-xl font-bold text-yellow-300 mb-2">Painel demorou para responder</h1>
          <p className="text-sm text-zinc-200 mb-6">
            O carregamento levou mais tempo que o esperado. Tente novamente ou volte ao Hub para
            selecionar o racha.
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="rounded-lg bg-yellow-400 text-black font-semibold px-4 py-2"
              onClick={() => mutateAccess()}
            >
              Tentar novamente
            </button>
            <button
              type="button"
              className="rounded-lg border border-zinc-500/40 bg-zinc-500/10 text-zinc-100 font-semibold px-4 py-2"
              onClick={() => router.replace("/admin/selecionar-racha")}
            >
              Voltar para selecionar racha
            </button>
            <button
              type="button"
              className="rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 font-semibold px-4 py-2"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
            >
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (shouldBlockForPermissionBootstrap) {
    return withSessionModal(<AdminLoading />);
  }

  if (access?.blocked && isStatusRoute) {
    return withSessionModal(<PainelAdminBloqueado motivo={access.reason || ""} />);
  }

  if (access?.blocked && !isBillingRoute) {
    return withSessionModal(<AdminLoading />);
  }

  if (tenantResolutionError) {
    return withSessionModal(
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181818] to-[#232323] text-white px-4">
        <div className="max-w-md w-full rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6 text-center">
          <h1 className="text-xl font-bold text-yellow-300 mb-2">
            Não foi possível abrir este racha
          </h1>
          <p className="text-sm text-zinc-200 mb-6">
            O painel ficou carregando além do esperado. Tente selecionar o racha novamente.
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="rounded-lg bg-yellow-400 text-black font-semibold px-4 py-2"
              onClick={() => router.replace("/admin/selecionar-racha")}
            >
              Voltar para selecionar racha
            </button>
            <button
              type="button"
              className="rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 font-semibold px-4 py-2"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
            >
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasStableTenantContext && !criticalFlowDirty) {
    return withSessionModal(<AdminLoading />);
  }

  return withSessionModal(
    <NotificationProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#181818] to-[#232323]">
        <ToastGlobal />
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        <div className="flex flex-1">
          <Sidebar />
          <Sidebar mobile isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
          <main className="flex-1 w-full px-4 sm:px-6 pt-20 md:pt-15 pb-24">{children}</main>
        </div>
        <BottomMenuAdmin />
      </div>
    </NotificationProvider>
  );
}
