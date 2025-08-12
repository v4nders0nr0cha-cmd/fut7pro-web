// src/context/AdminProvider.tsx
"use client";
import { createContext, useState, type ReactNode } from "react";
import type { Racha } from "@/types/racha";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";

interface AdminContextType {
  rachas: Racha[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  isSuccess: boolean;
  addRacha: (racha: Partial<Racha>) => Promise<Racha | null>;
  updateRacha: (id: string, racha: Partial<Racha>) => Promise<Racha | null>;
  editRacha: (id: string) => void;
  deleteRacha: (id: string) => Promise<boolean>;
  getRachaById: (id: string) => Racha | undefined;
  refreshRachas: () => Promise<void>;
}

export const AdminContext = createContext({} as AdminContextType);

export function AdminProvider({ children }: { children: ReactNode }) {
  const {
    rachas,
    isLoading,
    isError,
    error,
    isSuccess,
    addRacha: addRachaApi,
    updateRacha: updateRachaApi,
    deleteRacha: deleteRachaApi,
    mutateRachas,
    reset,
  } = useSuperAdmin();

  async function addRacha(racha: Partial<Racha>) {
    return addRachaApi(racha);
  }

  async function updateRacha(id: string, racha: Partial<Racha>) {
    return updateRachaApi(id, racha);
  }

  function editRacha(id: string) {
    window.location.href = `/admin/rachas/${id}`;
  }

  async function deleteRacha(id: string) {
    const result = await deleteRachaApi(id);
    return result !== null;
  }

  function getRachaById(id: string) {
    const found = rachas.find((r) => r.id === id);
    if (!found) return undefined;
    return {
      ...found,
      admins: found.admins ?? [],
      jogadores: found.jogadores ?? [],
    };
  }

  async function refreshRachas() {
    await mutateRachas();
  }

  return (
    <AdminContext.Provider
      value={{
        rachas,
        isLoading,
        isError,
        error,
        isSuccess,
        addRacha,
        updateRacha,
        editRacha,
        deleteRacha,
        getRachaById,
        refreshRachas,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
