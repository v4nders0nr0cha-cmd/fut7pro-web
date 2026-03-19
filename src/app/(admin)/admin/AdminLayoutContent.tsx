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

function SessionExpiredModal({
  open,
  renewing,
  errorMessage,
  onRetryRenew,
  onSignInAgain,
}: {
  open: boolean;
  renewing: boolean;
  errorMessage: string | null;
  onRetryRenew: () => void;
  onSignInAgain: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/75 backdrop-blur-[2px] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-yellow-500/35 bg-[#171717]/95 p-6 text-white shadow-[0_24px_80px_-28px_rgba(251,191,36,0.45)]">
        <h2 className="text-xl font-bold text-yellow-300">Sua sessão expirou por segurança.</h2>
        <p className="mt-2 text-sm text-zinc-200">
          Para continuar no painel sem perder o fluxo, tente renovar a sessão ou entre novamente.
        </p>
        {errorMessage ? <p className="mt-3 text-sm text-red-300">{errorMessage}</p> : null}
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-500 disabled:opacity-50"
            onClick={onRetryRenew}
            disabled={renewing}
          >
            {renewing ? "Tentando renovar..." : "Tentar renovar"}
          </button>
          <button
            type="button"
            className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/15"
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
  const [renewingSession, setRenewingSession] = useState(false);
  const [sessionModalError, setSessionModalError] = useState<string | null>(null);
  const [loadingTimeoutReached, setLoadingTimeoutReached] = useState(false);
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
  const hasResolvedTenant = Boolean(access?.tenant?.slug && access?.tenant?.id);

  const openSessionExpiredModal = useCallback(() => {
    setSessionModalError(null);
    setSessionExpiredModalOpen(true);
  }, []);

  useEffect(() => {
    if (!shouldForceSignOutForTokenError || tokenErrorHandledRef.current) return;
    tokenErrorHandledRef.current = true;
    openSessionExpiredModal();
  }, [shouldForceSignOutForTokenError, openSessionExpiredModal]);

  useEffect(() => {
    if (sessionStatus !== "unauthenticated") return;
    openSessionExpiredModal();
  }, [sessionStatus, openSessionExpiredModal]);

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
    if (!accessLoading) {
      setLoadingTimeoutReached(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setLoadingTimeoutReached(true);
    }, 15000);

    return () => window.clearTimeout(timer);
  }, [accessLoading]);

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
      if (sessionStatus === "authenticated" && unauthorizedRetryCountRef.current < 2) {
        unauthorizedRetryCountRef.current += 1;
        const retryDelay = 350 * unauthorizedRetryCountRef.current;
        window.setTimeout(() => {
          void mutateAccess();
        }, retryDelay);
        return;
      }
      openSessionExpiredModal();
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
  }, [accessLoading, accessError, sessionStatus, mutateAccess, router, openSessionExpiredModal]);

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

  const handleRenewSession = async () => {
    setRenewingSession(true);
    setSessionModalError(null);
    try {
      const nextSession = await updateSession();
      const nextTokenError = String((nextSession?.user as any)?.tokenError || "").trim();
      if (nextSession?.user && !nextTokenError) {
        unauthorizedRetryCountRef.current = 0;
        tokenErrorHandledRef.current = false;
        setSessionExpiredModalOpen(false);
        await mutateAccess();
        return;
      }
      setSessionModalError("Não foi possível renovar a sessão agora.");
    } catch {
      setSessionModalError("Não foi possível renovar a sessão agora.");
    } finally {
      setRenewingSession(false);
    }
  };

  const handleSignInAgain = () => {
    const callbackUrl = `/admin/login?expired=1&returnTo=${encodeURIComponent(pathname || "/admin/dashboard")}`;
    signOut({ callbackUrl });
  };

  const withSessionModal = (content: ReactNode) => (
    <>
      {content}
      <SessionExpiredModal
        open={sessionExpiredModalOpen}
        renewing={renewingSession}
        errorMessage={sessionModalError}
        onRetryRenew={handleRenewSession}
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

  if (loadingTimeoutReached && !access) {
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

  if (accessLoading) {
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

  if (!hasResolvedTenant) {
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
