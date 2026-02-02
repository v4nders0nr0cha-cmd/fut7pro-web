"use client";

import useSWR from "swr";
import type { AdminRoleAthlete } from "@/types/admin-roles";

type AdminRoleAthletesResponse = {
  results: AdminRoleAthlete[];
};

const fetcher = async (url: string): Promise<AdminRoleAthletesResponse> => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || "Erro ao carregar atletas");
  }
  return response.json();
};

export function useAdminRoleAthletes(query: string, enabled: boolean) {
  const params = new URLSearchParams();
  if (query.trim()) {
    params.set("q", query.trim());
  }
  const url = params.toString()
    ? `/api/admin/administradores/atletas?${params.toString()}`
    : "/api/admin/administradores/atletas";

  const { data, error, isLoading, mutate } = useSWR<AdminRoleAthletesResponse>(
    enabled ? url : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    athletes: data?.results ?? [],
    isLoading,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}
