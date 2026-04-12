"use client";

import { useCallback, useRef } from "react";
import { useContext } from "react";
import { SessionContext } from "next-auth/react";

type UseCriticalSessionRefreshOptions = {
  minIntervalMs?: number;
};

function hasUsableSession(sessionLike: any) {
  const accessToken = String(sessionLike?.user?.accessToken || "").trim();
  const tokenError = String(sessionLike?.user?.tokenError || "").trim();
  const hasFatalTokenError = tokenError.length > 0 && tokenError !== "RefreshAccessTokenRetry";
  return Boolean(accessToken) && !hasFatalTokenError;
}

export function useCriticalSessionRefresh(options: UseCriticalSessionRefreshOptions = {}) {
  const sessionContext = useContext(SessionContext);
  const hasSessionContext = Boolean(sessionContext);
  const data = sessionContext?.data ?? null;
  const status = sessionContext?.status ?? "unauthenticated";
  const update = sessionContext?.update ?? (async () => null);
  const minIntervalMs = options.minIntervalMs ?? 15_000;
  const inFlightRef = useRef<Promise<void> | null>(null);
  const lastAttemptAtRef = useRef(0);

  const ensureFreshSession = useCallback(async () => {
    if (!hasSessionContext) return;
    if (status === "loading") return;

    const now = Date.now();
    if (now - lastAttemptAtRef.current < minIntervalMs) {
      return;
    }

    if (inFlightRef.current) {
      return inFlightRef.current;
    }

    if (status !== "authenticated" && !hasUsableSession(data)) {
      throw new Error("Sessao expirada. Entre novamente.");
    }

    lastAttemptAtRef.current = now;
    const task = (async () => {
      try {
        const refreshed = await update();
        if (hasUsableSession(refreshed)) {
          return;
        }
      } catch {
        // fallback below
      }

      // Keep operation running when existing session is still usable.
      if (hasUsableSession(data)) {
        return;
      }

      throw new Error("Nao foi possivel validar sua sessao. Entre novamente.");
    })().finally(() => {
      inFlightRef.current = null;
    });

    inFlightRef.current = task;
    return task;
  }, [data, hasSessionContext, minIntervalMs, status, update]);

  return { ensureFreshSession };
}
