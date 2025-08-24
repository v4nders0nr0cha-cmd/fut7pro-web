"use client";

import useSWR from "swr";
import { superAdminApi, apiClient } from "@/lib/api";
import { useApiState } from "./useApiState";
import type { Racha, Metricas, Usuario } from "@/types";

// Fetcher customizado que usa o apiClient para aplicar normalização
const fetcher = async (url: string) => {
  // Extrair o endpoint da URL completa
  const endpoint = url.replace(/^https?:\/\/[^\/]+/, "");
  const response = await apiClient.get(endpoint);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data;
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

  const updateRacha = async (id: string, racha: Partial<Racha>) =>
    apiState.handleAsync(async () => {
      const response = await superAdminApi.updateRacha(id, racha);

      if (response.error) {
        throw new Error(response.error);
      }

      await mutateRachas();
      return response.data;
    });

  const deleteRacha = async (id: string) =>
    apiState.handleAsync(async () => {
      const response = await superAdminApi.deleteRacha(id);

      if (response.error) {
        throw new Error(response.error);
      }

      await mutateRachas();
      return response.data;
    });

  const addUsuario = async (usuario: Partial<Usuario>) =>
    apiState.handleAsync(async () => {
      const response = await superAdminApi.createUsuario(usuario);

      if (response.error) {
        throw new Error(response.error);
      }

      await mutateUsuarios();
      return response.data;
    });

  const updateUsuario = async (id: string, usuario: Partial<Usuario>) =>
    apiState.handleAsync(async () => {
      const response = await superAdminApi.updateUsuario(id, usuario);

      if (response.error) {
        throw new Error(response.error);
      }

      await mutateUsuarios();
      return response.data;
    });

  const deleteUsuario = async (id: string) =>
    apiState.handleAsync(async () => {
      const response = await superAdminApi.deleteUsuario(id);

      if (response.error) {
        throw new Error(response.error);
      }

      await mutateUsuarios();
      return response.data;
    });

  return {
    rachas: rachas || [],
    metricas: metricas || null,
    usuarios: usuarios || [],
    isLoading,
    isError,
    error: errorRachas || errorMetricas || errorUsuarios,
    addRacha,
    updateRacha,
    deleteRacha,
    addUsuario,
    updateUsuario,
    deleteUsuario,
    mutateRachas,
    mutateMetricas,
    mutateUsuarios,
    reset: apiState.reset,
  };
}
