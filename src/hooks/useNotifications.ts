// src/hooks/useNotifications.ts
"use client";

import useSWR from "swr";
import { useRacha } from "@/context/RachaContext";
import { notificacoesApi } from "@/lib/api";
import { useApiState } from "./useApiState";
import type { Notificacao } from "@/types/notificacao";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erro ao buscar notificações");
  }
  return response.json();
};

export function useNotifications() {
  const { rachaId } = useRacha();
  const apiState = useApiState();

  const { data, error, isLoading, mutate } = useSWR<Notificacao[]>(
    rachaId ? `/api/notificacoes?rachaId=${rachaId}` : null,
    fetcher,
    {
      onError: (err) => {
        if (process.env.NODE_ENV === "development") {
          console.log("Erro ao carregar notificações:", err);
        }
      },
    }
  );

  const markAsRead = async (id: string) => {
    return apiState.handleAsync(async () => {
      const response = await notificacoesApi.markAsRead(id);

      if (response.error) {
        throw new Error(response.error);
      }

      await mutate();
      return response.data;
    });
  };

  const markAllAsRead = async () => {
    return apiState.handleAsync(async () => {
      const response = await notificacoesApi.markAllAsRead();

      if (response.error) {
        throw new Error(response.error);
      }

      await mutate();
      return response.data;
    });
  };

  const deleteNotificacao = async (id: string) => {
    return apiState.handleAsync(async () => {
      const response = await notificacoesApi.delete(id);

      if (response.error) {
        throw new Error(response.error);
      }

      await mutate();
      return response.data;
    });
  };

  const getNotificacaoById = (id: string) => {
    return data?.find((n) => n.id === id);
  };

  const getNotificacoesNaoLidas = () => {
    return data?.filter((n) => !n.lida) || [];
  };

  const getNotificacoesPorTipo = (tipo: string) => {
    return (
      data?.filter((n) => {
        const currentType = (n as any).tipo ?? n.type;
        return currentType === tipo;
      }) || []
    );
  };

  return {
    notificacoes: data || [],
    unreadCount: getNotificacoesNaoLidas().length,
    isLoading: isLoading || apiState.isLoading,
    isError: !!error || apiState.isError,
    error: apiState.error,
    isSuccess: apiState.isSuccess,
    mutate,
    markAsRead,
    markAllAsRead,
    deleteNotificacao,
    getNotificacaoById,
    getNotificacoesNaoLidas,
    getNotificacoesPorTipo,
    reset: apiState.reset,
  };
}
