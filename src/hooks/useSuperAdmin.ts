"use client";

import useSWR from "swr";
import { superAdminApi } from "@/lib/api";
import { useApiState } from "./useApiState";
import type { Racha, Metricas, Usuario } from "@/types/superadmin";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erro ao buscar dados de SuperAdmin");
  }
  return response.json();
};

export function useSuperAdmin() {
  const apiState = useApiState();

  // Rachas
  const {
    data: rachas,
    error: errorRachas,
    isLoading: isLoadingRachas,
    mutate: mutateRachas,
  } = useSWR<Racha[]>("/api/superadmin/rachas", fetcher, {
    onError: (err) => {
      if (process.env.NODE_ENV === "development") {
        console.log("Erro ao carregar rachas:", err);
      }
    },
  });

  // Métricas
  const {
    data: metricas,
    error: errorMetricas,
    isLoading: isLoadingMetricas,
    mutate: mutateMetricas,
  } = useSWR<Metricas>("/api/superadmin/metrics", fetcher, {
    onError: (err) => {
      if (process.env.NODE_ENV === "development") {
        console.log("Erro ao carregar métricas:", err);
      }
    },
  });

  // Usuários
  const {
    data: usuarios,
    error: errorUsuarios,
    isLoading: isLoadingUsuarios,
    mutate: mutateUsuarios,
  } = useSWR<Usuario[]>("/api/superadmin/usuarios", fetcher, {
    onError: (err) => {
      if (process.env.NODE_ENV === "development") {
        console.log("Erro ao carregar usuários:", err);
      }
    },
  });

  const isLoading = isLoadingRachas || isLoadingMetricas || isLoadingUsuarios;
  const isError = !!errorRachas || !!errorMetricas || !!errorUsuarios;

  const addRacha = async (racha: Partial<Racha>) => {
    return apiState.handleAsync(async () => {
      const response = await superAdminApi.getRachas();

      if (response.error) {
        throw new Error(response.error);
      }

      await mutateRachas();
      return response.data;
    });
  };

  const updateRacha = async (id: string, racha: Partial<Racha>) => {
    return apiState.handleAsync(async () => {
      const response = await fetch(`/api/superadmin/rachas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(racha),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar racha");
      }

      await mutateRachas();
      return response.json();
    });
  };

  const deleteRacha = async (id: string) => {
    return apiState.handleAsync(async () => {
      const response = await fetch(`/api/superadmin/rachas/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao deletar racha");
      }

      await mutateRachas();
      return response.json();
    });
  };

  const getRachaById = (id: string) => {
    return rachas?.find((r) => r.id === id);
  };

  const getRachasPorStatus = (status: string) => {
    return rachas?.filter((r) => r.status === status) || [];
  };

  const refreshAll = async () => {
    await Promise.all([mutateRachas(), mutateMetricas(), mutateUsuarios()]);
  };

  return {
    rachas: rachas || [],
    metricas: metricas || null,
    usuarios: usuarios || [],
    isLoading,
    isError,
    error: apiState.error,
    isSuccess: apiState.isSuccess,
    addRacha,
    updateRacha,
    deleteRacha,
    getRachaById,
    getRachasPorStatus,
    refreshAll,
    mutateRachas,
    mutateMetricas,
    mutateUsuarios,
    reset: apiState.reset,
  };
}
