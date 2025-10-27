import useSWR from "swr";
import type { SuperadminFinanceiro } from "@/types/superadmin";

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const message = await response.text().catch(() => "Erro ao carregar financeiro");
    throw new Error(message || "Erro ao carregar financeiro");
  }
  return response.json();
};

export function useSuperadminFinanceiro() {
  const { data, error, isLoading, mutate } = useSWR<SuperadminFinanceiro>(
    "/api/superadmin/financeiro",
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    financeiro: data,
    isLoading,
    error,
    refresh: mutate,
  };
}
