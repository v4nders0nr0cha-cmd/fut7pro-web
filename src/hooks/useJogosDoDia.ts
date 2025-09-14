import useSWR from "swr";
import type { Partida } from "@/types/partida";

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Erro ao buscar jogos do dia");
  }
  return response.json();
};

export function useJogosDoDia() {
  // Usar mock se flag estiver ativa
  const useMock = process.env.NEXT_PUBLIC_USE_JOGOS_MOCK === "1";
  const endpoint = useMock ? "/api/public/jogos-do-dia-mock" : "/api/public/jogos-do-dia";

  const { data, error, mutate, isLoading } = useSWR<Partida[]>(endpoint, fetcher, {
    refreshInterval: 30000, // Atualiza a cada 30 segundos
    onError: (err) => {
      if (process.env.NODE_ENV === "development") {
        console.log("Erro ao carregar jogos do dia:", err);
      }
    },
  });

  return {
    jogos: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
