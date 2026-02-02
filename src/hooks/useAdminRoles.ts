"use client";

import useSWR from "swr";
import { useApiState } from "./useApiState";
import type { AdminRoleSlot } from "@/types/admin-roles";

type AdminRolesResponse = {
  slots: AdminRoleSlot[];
};

const fetcher = async (url: string): Promise<AdminRolesResponse> => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || "Erro ao carregar administradores");
  }
  return response.json();
};

export function useAdminRoles() {
  const apiState = useApiState();

  const { data, error, isLoading, mutate } = useSWR<AdminRolesResponse>(
    "/api/admin/administradores",
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const assignRole = async (role: string, athleteId: string) => {
    apiState.setLoading(true);
    try {
      const response = await fetch(`/api/admin/administradores/${role}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteId }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || "Erro ao salvar administrador");
      }

      const payload = await response.json().catch(() => ({}));
      await mutate();
      apiState.setSuccess(true);
      return payload;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar administrador";
      apiState.setError(message);
      throw err;
    }
  };

  const removeRole = async (role: string) => {
    apiState.setLoading(true);
    try {
      const response = await fetch(`/api/admin/administradores/${role}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || "Erro ao remover administrador");
      }

      const payload = await response.json().catch(() => ({}));
      await mutate();
      apiState.setSuccess(true);
      return payload;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao remover administrador";
      apiState.setError(message);
      throw err;
    }
  };

  return {
    slots: data?.slots ?? [],
    isLoading: isLoading || apiState.isLoading,
    isError: Boolean(error) || apiState.isError,
    error: (error instanceof Error ? error.message : null) || apiState.error,
    assignRole,
    removeRole,
    mutate,
    isSaving: apiState.isLoading,
  };
}
