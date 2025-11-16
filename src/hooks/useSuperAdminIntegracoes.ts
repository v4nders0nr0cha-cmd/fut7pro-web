"use client";

import useSWR from "swr";
import { useApiState } from "./useApiState";

export type SuperAdminIntegrationField = {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
};

export type SuperAdminIntegration = {
  id: string;
  slug: string;
  nome: string;
  descricao?: string | null;
  categoria: string;
  instrucoes?: string | null;
  logoUrl?: string | null;
  status: string;
  campos: SuperAdminIntegrationField[];
  configuracao?: Record<string, unknown> | null;
  destaque?: boolean;
};

const fetcher = async (url: string): Promise<SuperAdminIntegration[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Falha ao carregar integrações");
  }
  return response.json();
};

export function useSuperAdminIntegracoes() {
  const apiState = useApiState();
  const { data, error, isLoading, mutate } = useSWR<SuperAdminIntegration[]>(
    "/api/superadmin/integracoes",
    fetcher
  );

  const updateIntegracao = async (slug: string, payload: Record<string, unknown>) => {
    return apiState.handleAsync(async () => {
      const response = await fetch(`/api/superadmin/integracoes/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details.error ?? "Falha ao salvar integracao");
      }

      const json = await response.json().catch(() => null);
      await mutate();
      return json;
    });
  };

  return {
    data,
    error,
    isLoading: isLoading || apiState.isLoading,
    updateIntegracao,
    mutate,
    apiState,
  };
}
