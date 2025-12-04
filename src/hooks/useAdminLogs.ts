import useSWR from "swr";
import { useRacha } from "@/context/RachaContext";
import type { AdminLog } from "@/types/admin";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAdminLogs(rachaIdParam?: string) {
  const { rachaId: rachaIdContext } = useRacha();
  const rachaId = rachaIdParam || rachaIdContext;

  const { data, error, mutate } = useSWR<AdminLog[]>(
    rachaId ? `/api/admin/rachas/${rachaId}/logs` : null,
    fetcher
  );

  async function addLog(log: Partial<AdminLog>) {
    if (!rachaId) return;
    await fetch(`/api/admin/rachas/${rachaId}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    });
    mutate();
  }

  return {
    logs: data || [],
    isLoading: !error && !data && !!rachaId,
    isError: !!error,
    error: error?.message ?? null,
    addLog,
    mutate,
  };
}
