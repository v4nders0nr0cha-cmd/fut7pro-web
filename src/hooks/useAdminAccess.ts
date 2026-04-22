"use client";

import useSWR from "swr";
import type {
  ActiveCompensation,
  EffectiveAccessStatus,
  SubscriptionAccessSource,
} from "@/lib/api/billing";

export type AdminAccessResponse = {
  allowed: boolean;
  blocked: boolean;
  status?: string;
  accessStatus?: EffectiveAccessStatus;
  statusRaw?: string | null;
  reason?: string | null;
  trialEnd?: string | null;
  currentPeriodEnd?: string | null;
  planKey?: string | null;
  daysRemaining?: number | null;
  effectiveAccessUntil?: string | null;
  source?: SubscriptionAccessSource;
  accessSource?: SubscriptionAccessSource;
  canAccess?: boolean;
  manualBlocked?: boolean;
  lifecycleBlocked?: boolean;
  compensationActive?: boolean;
  activeCompensation?: ActiveCompensation | null;
  tenant?: {
    id: string;
    slug: string;
    name: string;
  } | null;
  role?: string | null;
};

const ADMIN_ACCESS_TIMEOUT_MS = 12000;
const ADMIN_ACCESS_MAX_ATTEMPTS = 2;
const ADMIN_ACCESS_RETRY_DELAY_MS = 250;

const fetcher = async (url: string): Promise<AdminAccessResponse> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), ADMIN_ACCESS_TIMEOUT_MS);

  try {
    for (let attempt = 0; attempt < ADMIN_ACCESS_MAX_ATTEMPTS; attempt += 1) {
      const res = await fetch(url, {
        cache: "no-store",
        credentials: "include",
        signal: controller.signal,
      });
      const text = await res.text();
      let body: any = text;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        body = text;
      }

      if (res.ok) {
        return body as AdminAccessResponse;
      }

      const canRetryUnauthorized = res.status === 401 && attempt + 1 < ADMIN_ACCESS_MAX_ATTEMPTS;
      if (canRetryUnauthorized) {
        await new Promise((resolve) => window.setTimeout(resolve, ADMIN_ACCESS_RETRY_DELAY_MS));
        continue;
      }

      const error = new Error(
        typeof body?.message === "string" ? body.message : "Falha ao validar acesso"
      ) as Error & { status?: number; body?: unknown };
      error.status = res.status;
      error.body = body;
      throw error;
    }

    const fallbackError = new Error("Falha ao validar acesso") as Error & {
      status?: number;
      body?: unknown;
    };
    fallbackError.status = 500;
    throw fallbackError;
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") {
      const timeoutError = new Error(
        "Tempo limite ao validar o acesso do painel. Tente novamente."
      ) as Error & { status?: number; body?: unknown };
      timeoutError.status = 408;
      timeoutError.body = { message: "admin_access_timeout" };
      throw timeoutError;
    }
    throw cause;
  } finally {
    window.clearTimeout(timeout);
  }
};

type UseAdminAccessOptions = {
  enabled?: boolean;
  tenantSlug?: string | null;
};

export function useAdminAccess(options: UseAdminAccessOptions = {}) {
  const enabled = options.enabled ?? true;
  const { data, error, isLoading, isValidating, mutate } = useSWR<AdminAccessResponse>(
    enabled ? "/api/admin/access" : null,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 60_000,
      dedupingInterval: 5_000,
      keepPreviousData: true,
    }
  );
  const isBootLoading = enabled ? !data && (isLoading || isValidating) : false;

  return {
    access: data ?? null,
    isLoading: isBootLoading,
    error,
    isValidating,
    mutate,
  };
}
