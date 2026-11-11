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
  const expiresAt = Number(sessionLike?.user?.accessTokenExp || 0);
  const hasFatalTokenError = tokenError.length > 0 && tokenError !== "RefreshAccessTokenRetry";
  return Boolean(accessToken) && !hasFatalTokenError && expiresAt * 1000 > Date.now();
}

export function useCriticalSessionRefresh(options: UseCriticalSessionRefreshOptions = {}) {
  const sessionContext = useContext(SessionContext);
  const hasSessionContext = Boolean(sessionContext);
  const data = sessionContext?.data ?? null;
  const status = sessionContext?.status ?? "unauthenticated";
  const update = sessionContext?.update;
  const minIntervalMs = options.minIntervalMs ?? 15_000;
  const inFlightRef = useRef<Promise<void> | null>(null);
  const lastAttemptAtRef = useRef(0);

  const ensureFreshSession = useCallback(async () => {
    if (!hasSessionContext || !update || status === "loading") {
      throw new Error("Sessao ainda nao validada.");
    }

    if (inFlightRef.current) {
      return inFlightRef.current;
    }

    const hasCurrentUsableSession = hasUsableSession(data);

    const now = Date.now();
    if (hasCurrentUsableSession && now - lastAttemptAtRef.current < minIntervalMs) {
      return;
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
