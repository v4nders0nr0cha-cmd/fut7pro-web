import useSWR from "swr";
import { useRacha } from "@/context/RachaContext";
import { partidasApi, apiClient } from "@/lib/api";
import { useApiState } from "./useApiState";
import type { Partida } from "@/types/partida";
import { partidasMock } from "@/components/lists/mockPartidas";

// Fetcher customizado que implementa fallback para mocks
const fetcher = async (url: string): Promise<Partida[]> => {
  try {
    // Tentar o backend primeiro
    const endpoint = url
      .replace(/^https?:\/\/[^\/]+/, "")
      .replace(/^\/api/, "");
    const response = await apiClient.get(endpoint);

    if (response.error) {
      throw new Error(response.error);
    }

    // Se chegou aqui, o backend funcionou
    return response.data as Partida[];
  } catch (error) {
    // Se o backend falhou, usar mocks padronizados
    console.log("🔄 Backend falhou, usando mocks:", error);
    return partidasMock;
  }
};

export function usePartidas() {
  const { rachaId } = useRacha();
  const apiState = useApiState();

  // Sempre tentar buscar dados, mas com fallback para mocks
  const { data, error, mutate, isLoading } = useSWR<Partida[]>(
    `/api/partidas?rachaId=${rachaId || "demo"}`,
    fetcher,
    {
      onError: (err) => {
        if (process.env.NODE_ENV === "development") {
          console.log("Erro ao carregar partidas:", err);
        }
      },
      // Configurações para melhor experiência do usuário
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // 30 segundos
    },
  );

  const addPartida = async (partida: Partial<Partida>) => {
    if (!rachaId) return null;

    return apiState.handleAsync(async () => {
      const response = await partidasApi.create({
        ...partida,
        rachaId,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      await mutate();
      return response.data;
    });
  };

  const updatePartida = async (id: string, partida: Partial<Partida>) => {
    return apiState.handleAsync(async () => {
      const response = await partidasApi.update(id, {
        ...partida,
        rachaId,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      await mutate();
      return response.data;
    });
  };

  const deletePartida = async (id: string) => {
    return apiState.handleAsync(async () => {
      const response = await partidasApi.delete(id);

      if (response.error) {
        throw new Error(response.error);
      }

      await mutate();
      return response.data;
    });
  };

  const getPartidaById = (id: string) => {
    return data?.find((p) => p.id === id);
  };

  // Sempre ter dados disponíveis (backend ou mocks)
  const partidasDisponiveis = data || partidasMock;
  const temErroBackend = !!error;
  const carregandoBackend = isLoading;

  return {
    partidas: partidasDisponiveis,
    isLoading: carregandoBackend || apiState.isLoading,
    isError: temErroBackend || apiState.isError,
    error: apiState.error,
    isSuccess: apiState.isSuccess,
    mutate,
    addPartida,
    updatePartida,
    deletePartida,
    getPartidaById,
    reset: apiState.reset,
  };
}
