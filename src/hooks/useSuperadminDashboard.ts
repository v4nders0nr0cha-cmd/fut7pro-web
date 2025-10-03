import useSWR from "swr";
import type { SuperadminMetrics } from "@/types/superadmin";

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const message = await response.text().catch(() => "Erro desconhecido");
    throw new Error(message || "Erro ao carregar dados do superadmin");
  }
  return response.json();
};

export function useSuperadminDashboard() {
  const { data, error, isLoading, mutate } = useSWR<SuperadminMetrics>(
    "/api/superadmin/metrics",
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    metrics: data,
    isLoading,
    error,
    refresh: mutate,
  };
}
