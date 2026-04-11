"use client";

import useSWR from "swr";
import { useApiState } from "@/hooks/useApiState";
import type {
  AccessCompensationApplyResponse,
  AccessCompensationHistoryResponse,
  AccessCompensationPreviewResponse,
  AccessCompensationSummaryResponse,
  ApplyAccessCompensationPayload,
  RevertAccessCompensationPayload,
  PreviewAccessCompensationPayload,
} from "@/types/access-compensation";

type HistoryFilters = {
  page?: number;
  pageSize?: number;
  tenantId?: string;
  status?: string;
  reasonCategory?: string;
  incidentCode?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
};

const fetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, { cache: "no-store" });
  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null
        ? ((data as Record<string, unknown>).message as string) ||
          ((data as Record<string, unknown>).error as string)
        : null;
    throw new Error(message || `Erro HTTP ${response.status}`);
  }
  return data as T;
};

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null
        ? ((data as Record<string, unknown>).message as string) ||
          ((data as Record<string, unknown>).error as string)
        : null;
    throw new Error(message || `Erro HTTP ${response.status}`);
  }
  return data as T;
};

function buildHistoryKey(filters: HistoryFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  if (filters.tenantId) params.set("tenantId", filters.tenantId);
  if (filters.status) params.set("status", filters.status);
  if (filters.reasonCategory) params.set("reasonCategory", filters.reasonCategory);
  if (filters.incidentCode) params.set("incidentCode", filters.incidentCode);
  if (filters.search) params.set("search", filters.search);
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  const query = params.toString();
  return `/api/superadmin/compensacoes-acesso/historico${query ? `?${query}` : ""}`;
}

export function useSuperAdminAccessCompensations(historyFilters: HistoryFilters = {}) {
  const apiState = useApiState();

  const {
    data: summary,
    error: summaryError,
    isLoading: summaryLoading,
    mutate: mutateSummary,
  } = useSWR<AccessCompensationSummaryResponse>(
    "/api/superadmin/compensacoes-acesso/resumo",
    (url) => fetcher<AccessCompensationSummaryResponse>(url),
    { revalidateOnFocus: false }
  );

  const historyKey = buildHistoryKey(historyFilters);
  const {
    data: history,
    error: historyError,
    isLoading: historyLoading,
    mutate: mutateHistory,
  } = useSWR<AccessCompensationHistoryResponse>(
    historyKey,
    (url) => fetcher<AccessCompensationHistoryResponse>(url),
    { revalidateOnFocus: false }
  );

  const previewCompensation = async (payload: PreviewAccessCompensationPayload) => {
    return apiState.handleAsync(async () => {
      return requestJson<AccessCompensationPreviewResponse>(
        "/api/superadmin/compensacoes-acesso/simular",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
    });
  };

  const applyCompensation = async (payload: ApplyAccessCompensationPayload) => {
    return apiState.handleAsync(async () => {
      const result = await requestJson<AccessCompensationApplyResponse>(
        "/api/superadmin/compensacoes-acesso/aplicar",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      await Promise.all([mutateSummary(), mutateHistory()]);
      return result;
    });
  };

  const revertCompensation = async (id: string, payload: RevertAccessCompensationPayload) => {
    return apiState.handleAsync(async () => {
      const result = await requestJson<{ ok: boolean; id: string }>(
        `/api/superadmin/compensacoes-acesso/${encodeURIComponent(id)}/reverter`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      await Promise.all([mutateSummary(), mutateHistory()]);
      return result;
    });
  };

  return {
    summary: summary ?? null,
    history: history ?? null,
    isLoading: summaryLoading || historyLoading || apiState.isLoading,
    isError: Boolean(summaryError || historyError || apiState.isError),
    error:
      apiState.error ||
      (summaryError instanceof Error
        ? summaryError.message
        : historyError instanceof Error
          ? historyError.message
          : null),
    previewCompensation,
    applyCompensation,
    revertCompensation,
    reload: async () => {
      await Promise.all([mutateSummary(), mutateHistory()]);
    },
  };
}
