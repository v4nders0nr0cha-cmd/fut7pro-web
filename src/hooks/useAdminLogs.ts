import useSWR from "swr";

export interface AdminLog {
  id: string;
  adminId: string;
  adminNome?: string;
  adminEmail?: string;
  acao: string;
  detalhes?: string;
  criadoEm: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAdminLogs(rachaId: string) {
  const { data, error, mutate } = useSWR<AdminLog[]>(
    rachaId ? `/api/admin/rachas/${rachaId}/logs` : null,
    fetcher
  );

  async function addLog(log: Partial<AdminLog>) {
    await fetch(`/api/admin/rachas/${rachaId}/logs`, {
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
    addLog,
    mutate,
  };
}
