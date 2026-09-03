import useSWR from "swr";
import type { DestaquesDiaRoundQueueResponse } from "@/types/destaques";

const EMPTY_QUEUE: DestaquesDiaRoundQueueResponse = {
  rodadasIncompletas: [],
  rodadasAguardandoCampeao: [],
  rodadasRegistradas: [],
  currentPublicSpotlightDate: null,
};

const fetcher = async (url: string): Promise<DestaquesDiaRoundQueueResponse> => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || "Falha ao carregar rodadas de pós-jogo.");
  }
  return response.json();
};

export function useAdminDestaquesRodadas() {
  const { data, error, isLoading, mutate } = useSWR<DestaquesDiaRoundQueueResponse>(
    "/api/admin/destaques-do-dia/rodadas",
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    queue: data ?? EMPTY_QUEUE,
    isLoading,
    isError: Boolean(error),
    error,
    mutate,
  };
}
