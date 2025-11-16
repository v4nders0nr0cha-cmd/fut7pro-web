"use client";

import useSWR from "swr";
import { useApiState } from "./useApiState";
import type { Metricas, Racha, SystemStats, Usuario } from "@/types/superadmin";

const fetchDashboard = async (url: string): Promise<Metricas> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erro ao carregar métricas do SuperAdmin");
  }
  const data = await response.json();
  return {
    tenantCount: Number(data?.tenantCount ?? 0),
    userCount: Number(data?.userCount ?? 0),
    matchCount: Number(data?.matchCount ?? 0),
    lastUpdated: data?.lastUpdated ?? null,
  };
};

const fetchTenants = async (url: string): Promise<Racha[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erro ao carregar rachas do SuperAdmin");
  }
  const payload = await response.json();
  if (!Array.isArray(payload)) {
    return [];
  }
  return payload.map((tenant: any) => ({
    id: tenant.id,
    nome: tenant.name ?? "Racha",
    slug: tenant.slug ?? tenant.id,
    subdominio: tenant.subdomain ?? "",
    criadoEm: tenant.createdAt ?? null,
    usuarios: tenant._count?.users ?? 0,
    partidas: tenant._count?.matches ?? 0,
    status: tenant.status ?? tenant.subscriptionStatus ?? undefined,
    plano: tenant.subscription?.plan ?? tenant.plano ?? null,
    ownerId: tenant.ownerId ?? tenant.owner?.id ?? null,
    atualizadoEm: tenant.updatedAt ?? null,
  }));
};

const fetchUsuarios = async (url: string): Promise<Usuario[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erro ao carregar usuários");
  }
  const payload = await response.json();
  if (!Array.isArray(payload)) {
    return [];
  }
  return payload.map((user: any) => ({
    id: user.id,
    nome: user.name ?? user.email,
    email: user.email,
    role: user.role ?? "ADMIN",
    criadoEm: user.createdAt ?? null,
    tenant: user.tenant
      ? {
          id: user.tenant.id,
          nome: user.tenant.name,
        }
      : null,
  }));
};

const fetchSystemStats = async (url: string): Promise<SystemStats> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erro ao carregar estatísticas do sistema");
  }
  return response.json();
};

export function useSuperAdmin() {
  const apiState = useApiState();

  const {
    data: rachas,
    error: errorRachas,
    isLoading: isLoadingRachas,
    mutate: mutateRachas,
  } = useSWR<Racha[]>("/api/superadmin/rachas", fetchTenants);

  const {
    data: metricas,
    error: errorMetricas,
    isLoading: isLoadingMetricas,
    mutate: mutateMetricas,
  } = useSWR<Metricas>("/api/superadmin/metrics", fetchDashboard);

  const {
    data: usuarios,
    error: errorUsuarios,
    isLoading: isLoadingUsuarios,
    mutate: mutateUsuarios,
  } = useSWR<Usuario[]>("/api/superadmin/usuarios", fetchUsuarios);

  const {
    data: systemStats,
    error: errorSystem,
    isLoading: isLoadingSystem,
    mutate: mutateSystemStats,
  } = useSWR<SystemStats>("/api/superadmin/system-stats", fetchSystemStats);

  const isLoading = isLoadingRachas || isLoadingMetricas || isLoadingUsuarios || isLoadingSystem;
  const aggregatedError =
    errorRachas?.message ??
    errorMetricas?.message ??
    errorUsuarios?.message ??
    errorSystem?.message ??
    apiState.error;
  const isError = Boolean(aggregatedError);

  const addRacha = async (_?: Partial<Racha>): Promise<Racha | null> =>
    Promise.reject(
      new Error("Operações de escrita para o SuperAdmin ainda não foram implementadas.")
    );

  const updateRacha = async (_?: string, __?: Partial<Racha>): Promise<Racha | null> =>
    Promise.reject(
      new Error("Operações de escrita para o SuperAdmin ainda não foram implementadas.")
    );

  const deleteRacha = async (_?: string): Promise<boolean> =>
    Promise.reject(
      new Error("Operações de escrita para o SuperAdmin ainda não foram implementadas.")
    );

  const getRachaById = (id: string) => rachas?.find((r) => r.id === id);

  const getRachasPorStatus = (status: string) => rachas?.filter((r) => r.status === status) || [];

  const refreshAll = async () => {
    await Promise.all([mutateRachas(), mutateMetricas(), mutateUsuarios(), mutateSystemStats()]);
  };

  return {
    rachas: rachas || [],
    metricas: metricas || null,
    usuarios: usuarios || [],
    systemStats: systemStats ?? null,
    isLoading,
    isError,
    error: aggregatedError,
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
    mutateSystemStats,
    reset: apiState.reset,
  };
}
