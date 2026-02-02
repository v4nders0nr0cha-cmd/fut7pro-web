import useSWR from "swr";
import type { AdminLog } from "@/types/admin";

export type AdminLogsFilters = {
  action?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
};

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || "Erro ao carregar logs");
  }
  return response.json();
};

function buildQuery(filters?: AdminLogsFilters) {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.action) params.set("action", filters.action);
  if (filters.userId) params.set("userId", filters.userId);
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  if (filters.limit) params.set("limit", String(filters.limit));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function useAdminLogs(filters?: AdminLogsFilters) {
  const query = buildQuery(filters);
  const { data, error, mutate } = useSWR<AdminLog[]>(`/api/admin/logs${query}`, fetcher, {
    revalidateOnFocus: false,
  });

  async function addLog(log: Partial<AdminLog>) {
    await fetch(`/api/admin/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    });
    mutate();
  }

  return {
    logs: data || [],
    isLoading: !error && !data,
    isError: !!error,
    error: error?.message ?? null,
    addLog,
    mutate,
  };
}
