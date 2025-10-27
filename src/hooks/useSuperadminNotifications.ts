import useSWR from "swr";
import type { SuperadminNotification } from "@/types/superadmin";

interface ResponsePayload {
  itens: SuperadminNotification[];
}

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const message = await response.text().catch(() => "Erro ao carregar notificacoes");
    throw new Error(message || "Erro ao carregar notificacoes");
  }
  return response.json();
};

export function useSuperadminNotifications() {
  const { data, error, isLoading, mutate } = useSWR<ResponsePayload>(
    "/api/superadmin/notificacoes",
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    notificacoes: data?.itens ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}
