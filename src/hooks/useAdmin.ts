"use client";

import useSWR from "swr";
import { useRacha } from "@/context/RachaContext";
import { useApiState } from "./useApiState";
import type { Admin } from "@/types/admin";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erro ao buscar dados de admin");
  }
  return response.json();
};

export function useAdmin() {
  const { rachaId } = useRacha();
  const apiState = useApiState();

  const { data, error, isLoading, mutate } = useSWR<Admin[]>(
    rachaId ? `/api/admin/admins?rachaId=${rachaId}` : null,
    fetcher,
    {
      onError: (err) => {
        if (process.env.NODE_ENV === "development") {
          console.log("Erro ao carregar dados de admin:", err);
        }
      },
    }
  );

  const addAdmin = async (admin: Partial<Admin>) => {
    if (!rachaId) return null;

    return apiState.handleAsync(async () => {
      const response = await fetch(`/api/admin/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...admin, rachaId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar admin");
      }

      await mutate();
      return response.json();
    });
  };

  const updateAdmin = async (id: string, admin: Partial<Admin>) => {
    return apiState.handleAsync(async () => {
      const response = await fetch(`/api/admin/admins/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...admin, rachaId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar admin");
      }

      await mutate();
      return response.json();
    });
  };

  const deleteAdmin = async (id: string) => {
    return apiState.handleAsync(async () => {
      const response = await fetch(`/api/admin/admins/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao deletar admin");
      }

      await mutate();
      return response.json();
    });
  };

  const getAdminById = (id: string) => {
    return data?.find((a) => a.id === id);
  };

  const getAdminsPorRole = (role: string) => {
    return data?.filter((a) => a.role === role) || [];
  };

  return {
    admins: data || [],
    isLoading: isLoading || apiState.isLoading,
    isError: !!error || apiState.isError,
    error: apiState.error,
    isSuccess: apiState.isSuccess,
    mutate,
    addAdmin,
    updateAdmin,
    deleteAdmin,
    getAdminById,
    getAdminsPorRole,
    reset: apiState.reset,
  };
}
