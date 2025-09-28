"use client";

import useSWR from "swr";
import { useRacha } from "@/context/RachaContext";
import { useApiState } from "./useApiState";
import type { Campeao, CreateCampeaoInput, UpdateCampeaoInput } from "@/types/campeao";

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && typeof payload.error === "string" ? payload.error : "Erro ao buscar campeoes";
    throw new Error(message);
  }
  return (payload ?? []) as Campeao[];
};

async function request<T>(input: RequestInfo, init: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (response.status === 204) {
    return null as T;
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && typeof payload.error === "string" ? payload.error : "Erro ao processar campeoes";
    throw new Error(message);
  }
  return payload as T;
}

export function useCampeoes() {
  const { rachaId } = useRacha();
  const apiState = useApiState();

  const { data, error, isLoading, mutate } = useSWR<Campeao[]>(
    rachaId ? `/api/campeoes?rachaId=${rachaId}` : null,
    fetcher,
    {
      onError: (err) => {
        if (process.env.NODE_ENV === "development") {
          console.log("Erro ao carregar campeoes:", err);
        }
      },
    }
  );

  const addCampeao = async (campeao: Partial<Campeao>) => {
    if (!rachaId) return null;

    return apiState.handleAsync(async () => {
      const payload: CreateCampeaoInput = {
        rachaId,
        nome: campeao.nome ?? "",
        categoria: campeao.categoria ?? "",
        data: campeao.data ?? new Date().toISOString(),
        descricao: campeao.descricao ?? undefined,
        jogadores: campeao.jogadores ?? undefined,
        imagem: campeao.imagem ?? undefined,
      };

      const created = await request<Campeao>("/api/campeoes", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      await mutate();
      return created;
    });
  };

  const updateCampeao = async (id: string, campeao: Partial<Campeao>) => {
    return apiState.handleAsync(async () => {
      const payload: UpdateCampeaoInput = {
        ...(rachaId ? { rachaId } : {}),
        nome: campeao.nome ?? undefined,
        categoria: campeao.categoria ?? undefined,
        data: campeao.data ?? undefined,
        descricao: campeao.descricao ?? undefined,
        jogadores: campeao.jogadores ?? undefined,
        imagem: campeao.imagem ?? undefined,
      };

      const updated = await request<Campeao>(`/api/campeoes/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      await mutate();
      return updated;
    });
  };

  const deleteCampeao = async (id: string) => {
    return apiState.handleAsync(async () => {
      await request<null>(`/api/campeoes/${id}`, { method: "DELETE" });
      await mutate();
      return null;
    });
  };

  const getCampeaoById = (id: string) => {
    return data?.find((item) => item.id === id);
  };

  const combinedError = apiState.error ?? (error instanceof Error ? error.message : null);
  const hasError = Boolean(apiState.isError || error);

  return {
    campeoes: data || [],
    isLoading: isLoading || apiState.isLoading,
    isError: hasError,
    error: combinedError,
    isSuccess: apiState.isSuccess,
    mutate,
    addCampeao,
    updateCampeao,
    deleteCampeao,
    getCampeaoById,
    reset: apiState.reset,
  };
}
