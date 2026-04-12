"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSessionRefreshScheduler } from "@/hooks/useSessionRefreshScheduler";

export function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  const { data, status, update: updateSession } = useSession();
  const router = useRouter();
  const unauthenticatedRecoveryAttemptedRef = useRef(false);
  const unauthenticatedRecoveryTimerRef = useRef<number | null>(null);
  const [recoveringSession, setRecoveringSession] = useState(false);

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
    onRefreshFailed: async () => {
      await signOutSuper({ callbackUrl: "/superadmin/login" }).catch(() => {
        router.replace("/superadmin/login");
      });
    },
  });

  useEffect(() => {
    if (status !== "unauthenticated") {
      unauthenticatedRecoveryAttemptedRef.current = false;
      setRecoveringSession(false);
      if (unauthenticatedRecoveryTimerRef.current) {
        window.clearTimeout(unauthenticatedRecoveryTimerRef.current);
        unauthenticatedRecoveryTimerRef.current = null;
      }
      return;
    }

    if (unauthenticatedRecoveryAttemptedRef.current) {
      router.replace("/superadmin/login");
      return;
    }

    unauthenticatedRecoveryAttemptedRef.current = true;
    setRecoveringSession(true);
    unauthenticatedRecoveryTimerRef.current = window.setTimeout(() => {
      void (async () => {
        try {
          const nextSession = await updateSession();
          if (isValidSuperAdminSession(nextSession)) {
            unauthenticatedRecoveryAttemptedRef.current = false;
            setRecoveringSession(false);
            return;
          }
        } catch {
          // keep fallback redirect below
        }
        setRecoveringSession(false);
        router.replace("/superadmin/login");
      })();
    }, 350);

    return () => {
      if (unauthenticatedRecoveryTimerRef.current) {
        window.clearTimeout(unauthenticatedRecoveryTimerRef.current);
        unauthenticatedRecoveryTimerRef.current = null;
      }
    };
  }, [isValidSuperAdminSession, router, status, updateSession]);

  useEffect(() => {
    if (status === "loading" || status === "unauthenticated") return;

    if (status === "authenticated" && (!isSuperAdmin || hasFatalTokenError)) {
      signOutSuper({ callbackUrl: "/superadmin/login" }).catch(() => {
        router.replace("/superadmin/login");
      });
    }
  }, [hasFatalTokenError, isSuperAdmin, router, signOutSuper, status]);

  if (status === "loading" || recoveringSession) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-200">
        Carregando...
      </div>
    );
  }

  if (status !== "authenticated" || !isSuperAdmin || hasFatalTokenError) {
    return null;
  }

  return <>{children}</>;
}
