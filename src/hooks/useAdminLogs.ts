import useSWR from "swr";
import type { LogAdmin } from "@/types/admin";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAdminLogs(rachaId: string | null | undefined) {
  const { data, error, mutate } = useSWR<LogAdmin[]>(
    rachaId ? `/api/admin/rachas/${rachaId}/logs` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  async function addLog(log: Partial<LogAdmin>) {
    await fetch(`/api/admin/rachas/${rachaId}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    });
    await mutate();
  }

  const logs = Array.isArray(data)
    ? data.map((log) => ({
        ...log,
        criadoEm: log.criadoEm ?? log.data ?? "",
      }))
    : [];

  return {
    logs,
    isLoading: !error && !data,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    addLog,
    mutate,
  };
}
