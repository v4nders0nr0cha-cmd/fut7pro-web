import useSWR from "swr";
import { useRacha } from "@/context/RachaContext";
import { useApiState } from "./useApiState";
import type { Partida } from "@/types/partida";

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      payload && typeof payload.error === "string" ? payload.error : "Erro ao buscar partidas";
    throw new Error(message);
  }

  return response.json();
};

async function requestPartidas<T>(
  method: "POST" | "PUT" | "DELETE",
  body: Record<string, unknown>
) {
  const response = await fetch("/api/admin/partidas", {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (response.status === 204) {
    return null as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload.error === "string" ? payload.error : "Erro ao salvar partidas";
    throw new Error(message);
  }

  return payload as T;
}

export function usePartidas() {
  const { rachaId } = useRacha();
  const apiState = useApiState();

  const { data, error, mutate, isLoading } = useSWR<Partida[]>(
    rachaId ? `/api/partidas?rachaId=${rachaId}` : null,
    fetcher,
    {
      onError: (err) => {
        if (process.env.NODE_ENV === "development") {
          console.log("Erro ao carregar partidas:", err);
        }
      },
    }
  );

  const swrErrorMessage = error instanceof Error ? error.message : null;
  const combinedError = apiState.error ?? swrErrorMessage;
  const hasSwrError = Boolean(error);
  const hasAsyncError = apiState.isError;
  const hasError = hasSwrError || hasAsyncError;

  const addPartida = async (partida: Partial<Partida>) => {
    if (!rachaId) return null;

    return apiState.handleAsync(async () => {
      const created = await requestPartidas<Partida>("POST", {
        ...partida,
        rachaId,
      });

      await mutate();
      return created;
    });
  };

  const updatePartida = async (id: string, partida: Partial<Partida>) => {
    return apiState.handleAsync(async () => {
      const updated = await requestPartidas<Partida>("PUT", {
        id,
        ...partida,
        rachaId,
      });

      await mutate();
      return updated;
    });
  };

  const deletePartida = async (id: string) => {
    return apiState.handleAsync(async () => {
      await requestPartidas<null>("DELETE", { id, rachaId });
      await mutate();
      return null;
    });
  };

  const getPartidaById = (id: string) => {
    return data?.find((p) => p.id === id);
  };

  return {
    partidas: data || [],
    isLoading: isLoading || apiState.isLoading,
    isError: hasError,
    error: combinedError,
    isSuccess: apiState.isSuccess,
    mutate,
    addPartida,
    updatePartida,
    deletePartida,
    getPartidaById,
    reset: apiState.reset,
  };
}
