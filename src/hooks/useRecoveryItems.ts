"use client";

import useSWR from "swr";
import type {
  RecoveryApiError,
  RecoveryEntityType,
  RecoveryListResponse,
  RecoveryOperationType,
} from "@/types/recovery";

type RecoveryKey = readonly [url: string, tenantScope: string];

async function recoveryFetcher([url]: RecoveryKey): Promise<RecoveryListResponse> {
  const response = await fetch(url, { cache: "no-store" });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (body as { message?: string; error?: string } | null)?.message ||
      (body as { message?: string; error?: string } | null)?.error ||
      "Não foi possível carregar os registros recuperáveis.";
    const error = new Error(message) as RecoveryApiError;
    error.status = response.status;
    throw error;
  }

  return body as RecoveryListResponse;
}

export function useRecoveryItems(options: {
  entityType?: RecoveryEntityType;
  operationType?: RecoveryOperationType;
  page: number;
  limit?: number;
  tenantScope: string;
  enabled?: boolean;
}) {
  const params = new URLSearchParams();
  if (options.entityType) params.set("entityType", options.entityType);
  if (options.operationType) params.set("operationType", options.operationType);
  params.set("page", String(options.page));
  params.set("limit", String(options.limit ?? 20));

  const url = `/api/admin/recuperacao?${params.toString()}`;
  const key: RecoveryKey | null =
    options.enabled !== false && options.tenantScope ? [url, options.tenantScope] : null;
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    RecoveryListResponse,
    RecoveryApiError,
    RecoveryKey | null
  >(key, recoveryFetcher, {
    revalidateOnFocus: false,
    keepPreviousData: false,
  });

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}
