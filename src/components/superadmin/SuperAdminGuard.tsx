"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSessionRefreshScheduler } from "@/hooks/useSessionRefreshScheduler";

function SuperAdminSessionRecoveryNotice({
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
        <h2 className="text-sm font-bold text-yellow-300">
          Reconectando sua sessão SuperAdmin em segundo plano
        </h2>
        <p className="mt-1 text-xs text-zinc-200">
          O painel permanece aberto enquanto tentamos recuperar a sessão automaticamente.
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

export function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  const { data, status, update: updateSession } = useSession();
  const router = useRouter();
  const unauthenticatedRecoveryInFlightRef = useRef(false);
  const unauthenticatedRecoveryAttemptCountRef = useRef(0);
  const unauthenticatedRecoveryTimerRef = useRef<number | null>(null);
  const [sessionRecoveryNoticeOpen, setSessionRecoveryNoticeOpen] = useState(false);
  const [sessionRecoveryError, setSessionRecoveryError] = useState<string | null>(null);

  const role = String((data?.user as any)?.role || "").trim();
  const accessToken = String((data?.user as any)?.accessToken || "").trim();
  const tokenError = String((data?.user as any)?.tokenError || "").trim();
  const hasFatalTokenError = tokenError.length > 0 && tokenError !== "RefreshAccessTokenRetry";
  const isSuperAdmin = (role === "SUPERADMIN" || role === "superadmin") && Boolean(accessToken);
  const signOutSuper = useCallback(
    (params?: any) => (signOut as any)({ basePath: "/api/superadmin-auth", ...params }),
    []
  );

  const isValidSuperAdminSession = useCallback((sessionLike: any) => {
    const nextRole = String(sessionLike?.user?.role || "").trim();
    const nextAccessToken = String(sessionLike?.user?.accessToken || "").trim();
    const nextTokenError = String(sessionLike?.user?.tokenError || "").trim();
    const nextHasFatalTokenError =
      nextTokenError.length > 0 && nextTokenError !== "RefreshAccessTokenRetry";
    return (
      (nextRole === "SUPERADMIN" || nextRole === "superadmin") &&
      Boolean(nextAccessToken) &&
      !nextHasFatalTokenError
    );
  }, []);

  useSessionRefreshScheduler({
    status: status as "loading" | "authenticated" | "unauthenticated",
    session: data as any,
    refreshSession: updateSession as any,
    enabled: status === "authenticated" && isSuperAdmin && !hasFatalTokenError,
    maxRetries: 8,
    refreshLeadMs: 180_000,
    fallbackIntervalMs: 60_000,
    heartbeatIntervalMs: 55_000,
    activityThrottleMs: 20_000,
    onRefreshSuccess: () => {
      unauthenticatedRecoveryAttemptCountRef.current = 0;
      setSessionRecoveryNoticeOpen(false);
      setSessionRecoveryError(null);
    },
    onRefreshFailed: () => {
      setSessionRecoveryNoticeOpen(true);
      setSessionRecoveryError(
        "A sessão está oscilando. Tentando reconectar automaticamente em segundo plano."
      );
    },
  });

  useEffect(() => {
    if (status === "authenticated" && isSuperAdmin && !hasFatalTokenError) {
      setSessionRecoveryNoticeOpen(false);
      setSessionRecoveryError(null);
    }
  }, [hasFatalTokenError, isSuperAdmin, status]);

  useEffect(() => {
    if (!hasFatalTokenError) return;
    setSessionRecoveryNoticeOpen(true);
    setSessionRecoveryError("Detectamos instabilidade de autenticação e iniciamos reconexão.");
  }, [hasFatalTokenError]);

  useEffect(() => {
    if (status !== "unauthenticated") {
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
        unauthenticatedRecoveryInFlightRef.current = false;
        setSessionRecoveryNoticeOpen(true);
        setSessionRecoveryError(
          "Nao foi possivel reconectar automaticamente. Clique em 'Entrar novamente'."
        );
        return;
      }

      unauthenticatedRecoveryInFlightRef.current = true;
      unauthenticatedRecoveryAttemptCountRef.current += 1;

      try {
        const nextSession = await updateSession();
        if (isValidSuperAdminSession(nextSession)) {
          unauthenticatedRecoveryAttemptCountRef.current = 0;
          unauthenticatedRecoveryInFlightRef.current = false;
          setSessionRecoveryNoticeOpen(false);
          setSessionRecoveryError(null);
          return;
        }
      } catch {
        // keep retry loop active
      }

      const attemptIdx = unauthenticatedRecoveryAttemptCountRef.current - 1;
      const nextDelay = ATTEMPT_DELAYS[Math.min(attemptIdx, ATTEMPT_DELAYS.length - 1)] ?? 12000;
      setSessionRecoveryNoticeOpen(true);
      setSessionRecoveryError("Reconectando sessao automaticamente em segundo plano.");
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
  }, [isValidSuperAdminSession, status, updateSession]);

  const handleSignInAgain = useCallback(() => {
    signOutSuper({ callbackUrl: "/superadmin/login" }).catch(() => {
      router.replace("/superadmin/login");
    });
  }, [router, signOutSuper]);

  useEffect(() => {
    if (status === "authenticated" && !isSuperAdmin) {
      handleSignInAgain();
    }
  }, [handleSignInAgain, isSuperAdmin, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-200">
        Carregando...
      </div>
    );
  }

  if (status !== "authenticated" || !isSuperAdmin || hasFatalTokenError) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center text-zinc-200 px-4 text-center">
          Validando sessao do SuperAdmin...
        </div>
        <SuperAdminSessionRecoveryNotice
          open={sessionRecoveryNoticeOpen || status === "unauthenticated" || hasFatalTokenError}
          errorMessage={sessionRecoveryError}
          onSignInAgain={handleSignInAgain}
        />
      </>
    );
  }

  return (
    <>
      {children}
      <SuperAdminSessionRecoveryNotice
        open={sessionRecoveryNoticeOpen}
        errorMessage={sessionRecoveryError}
        onSignInAgain={handleSignInAgain}
      />
    </>
  );
}
