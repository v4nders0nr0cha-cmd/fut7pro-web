"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type SessionLike = {
  user?: {
    accessToken?: string | null;
    accessTokenExp?: number | null;
    tokenError?: string | null;
  } | null;
} | null;

type RefreshSessionFn = () => Promise<SessionLike>;

type UseSessionRefreshSchedulerParams = {
  status: SessionStatus;
  session: SessionLike;
  refreshSession: RefreshSessionFn;
  enabled?: boolean;
  maxRetries?: number;
  refreshLeadMs?: number;
  fallbackIntervalMs?: number;
  heartbeatIntervalMs?: number;
  activityThrottleMs?: number;
  onRefreshSuccess?: (session: SessionLike) => void | Promise<void>;
  onRefreshFailed?: () => void | Promise<void>;
};

const DEFAULT_REFRESH_LEAD_MS = 90_000;
const DEFAULT_FALLBACK_INTERVAL_MS = 180_000;
const DEFAULT_HEARTBEAT_INTERVAL_MS = 60_000;
const DEFAULT_ACTIVITY_THROTTLE_MS = 30_000;
const MIN_REFRESH_DELAY_MS = 15_000;
const RETRY_DELAY_MS = [2_000, 7_000, 12_000];

function parseTokenExp(session: SessionLike) {
  const raw = (session?.user as { accessTokenExp?: number | null } | undefined)?.accessTokenExp;
  return typeof raw === "number" && Number.isFinite(raw) ? raw : null;
}

function isSessionHealthy(session: SessionLike) {
  const tokenError = String(
    (session?.user as { tokenError?: string | null } | undefined)?.tokenError || ""
  ).trim();
  const accessToken = String(session?.user?.accessToken || "").trim();
  if (!accessToken) return false;

  if (!tokenError) return true;
  if (tokenError !== "RefreshAccessTokenRetry") return false;

  const tokenExp = parseTokenExp(session);
  if (!tokenExp) return false;

  // When retrying refresh, keep session only while token is still effectively valid.
  return tokenExp * 1000 > Date.now() + 15_000;
}

export function useSessionRefreshScheduler(params: UseSessionRefreshSchedulerParams) {
  const {
    status,
    session,
    refreshSession,
    enabled = true,
    maxRetries = 5,
    refreshLeadMs = DEFAULT_REFRESH_LEAD_MS,
    fallbackIntervalMs = DEFAULT_FALLBACK_INTERVAL_MS,
    heartbeatIntervalMs = DEFAULT_HEARTBEAT_INTERVAL_MS,
    activityThrottleMs = DEFAULT_ACTIVITY_THROTTLE_MS,
    onRefreshSuccess,
    onRefreshFailed,
  } = params;

  const timerRef = useRef<number | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const retriesRef = useRef(0);
  const inFlightRef = useRef(false);
  const lastRefreshAtRef = useRef(0);
  const lastActivityRefreshAtRef = useRef(0);
  const latestSessionRef = useRef<SessionLike>(session);
  const runRefreshRef = useRef<() => Promise<void>>(async () => {});

  latestSessionRef.current = session;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      window.clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const scheduleDelay = useMemo(() => {
    const tokenExp = parseTokenExp(session);
    if (!tokenExp) return Math.max(MIN_REFRESH_DELAY_MS, fallbackIntervalMs);
    const nowMs = Date.now();
    const targetMs = tokenExp * 1000 - refreshLeadMs;
    return Math.max(MIN_REFRESH_DELAY_MS, targetMs - nowMs);
  }, [fallbackIntervalMs, refreshLeadMs, session]);

  const scheduleRetry = useCallback(
    (attempt: number) => {
      const retryDelay = RETRY_DELAY_MS[Math.min(attempt, RETRY_DELAY_MS.length - 1)] ?? 12_000;
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        void runRefreshRef.current();
      }, retryDelay);
    },
    [clearTimer]
  );

  const scheduleNext = useCallback(
    (nextSession?: SessionLike | null) => {
      if (!enabled || status !== "authenticated") return;
      const baseSession = nextSession ?? latestSessionRef.current;
      const tokenExp = parseTokenExp(baseSession);
      const nowMs = Date.now();
      const delay = tokenExp
        ? Math.max(MIN_REFRESH_DELAY_MS, tokenExp * 1000 - refreshLeadMs - nowMs)
        : Math.max(MIN_REFRESH_DELAY_MS, fallbackIntervalMs);
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        void runRefreshRef.current();
      }, delay);
    },
    [clearTimer, enabled, fallbackIntervalMs, refreshLeadMs, status]
  );

  const runRefresh = useCallback(async () => {
    if (!enabled || status !== "authenticated") return;
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    try {
      const nextSession = await refreshSession();
      latestSessionRef.current = nextSession;
      lastRefreshAtRef.current = Date.now();

      if (isSessionHealthy(nextSession)) {
        retriesRef.current = 0;
        if (onRefreshSuccess) {
          await onRefreshSuccess(nextSession);
        }
        scheduleNext(nextSession);
        return;
      }

      if (retriesRef.current < maxRetries) {
        retriesRef.current += 1;
        scheduleRetry(retriesRef.current - 1);
        return;
      }

      if (onRefreshFailed) {
        await onRefreshFailed();
      }
    } catch {
      if (retriesRef.current < maxRetries) {
        retriesRef.current += 1;
        scheduleRetry(retriesRef.current - 1);
        return;
      }

      if (onRefreshFailed) {
        await onRefreshFailed();
      }
    } finally {
      inFlightRef.current = false;
    }
  }, [
    enabled,
    maxRetries,
    onRefreshFailed,
    onRefreshSuccess,
    refreshSession,
    scheduleNext,
    scheduleRetry,
    status,
  ]);
  runRefreshRef.current = runRefresh;

  useEffect(() => {
    if (!enabled || status !== "authenticated") {
      retriesRef.current = 0;
      clearTimer();
      clearHeartbeat();
      return;
    }
    scheduleNext(session);
    clearHeartbeat();
    heartbeatRef.current = window.setInterval(() => {
      void runRefreshRef.current();
    }, Math.max(MIN_REFRESH_DELAY_MS, heartbeatIntervalMs));

    return () => {
      clearTimer();
      clearHeartbeat();
    };
  }, [clearHeartbeat, clearTimer, enabled, heartbeatIntervalMs, scheduleNext, session, status]);

  useEffect(() => {
    if (!enabled || status !== "authenticated") return;

    const maybeRefreshSoon = () => {
      const tokenExp = parseTokenExp(latestSessionRef.current);
      const sinceLastRefresh = Date.now() - lastRefreshAtRef.current;
      if (!tokenExp) {
        if (sinceLastRefresh >= activityThrottleMs) {
          void runRefreshRef.current();
        }
        return;
      }
      const remainingMs = tokenExp * 1000 - Date.now();
      if (remainingMs <= refreshLeadMs + 5 * 60_000 || sinceLastRefresh >= heartbeatIntervalMs) {
        void runRefreshRef.current();
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        maybeRefreshSoon();
      }
    };

    const onActivity = () => {
      const now = Date.now();
      if (now - lastActivityRefreshAtRef.current < activityThrottleMs) {
        return;
      }
      lastActivityRefreshAtRef.current = now;
      maybeRefreshSoon();
    };

    window.addEventListener("focus", maybeRefreshSoon);
    window.addEventListener("pointerdown", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity);
    window.addEventListener("touchstart", onActivity, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", maybeRefreshSoon);
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("touchstart", onActivity);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [activityThrottleMs, enabled, heartbeatIntervalMs, refreshLeadMs, status]);

  return {
    nextRefreshInMs: scheduleDelay,
  };
}
