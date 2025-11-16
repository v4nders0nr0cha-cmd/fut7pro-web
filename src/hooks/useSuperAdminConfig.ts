"use client";

import useSWR from "swr";
import { useApiState } from "./useApiState";

export type SuperAdminConfigLog = {
  id: string;
  message: string;
  createdAt: string;
};

export type SuperAdminConfig = {
  id: string;
  empresa: string;
  logoUrl: string | null;
  suporteEmail: string;
  dominioPrincipal: string;
  planoAtual: string | null;
  vencimento: string | null;
  webhookUrl: string | null;
  apiKey: string | null;
  alertaFinanceiro: boolean;
  alertaUsuarioNovo: boolean;
  alertaIncidentes: boolean;
  backupAtivo: boolean;
  logs: SuperAdminConfigLog[];
};

type ConfigPayload = Partial<
  Pick<
    SuperAdminConfig,
    | "empresa"
    | "logoUrl"
    | "suporteEmail"
    | "dominioPrincipal"
    | "planoAtual"
    | "vencimento"
    | "webhookUrl"
    | "apiKey"
    | "alertaFinanceiro"
    | "alertaUsuarioNovo"
    | "alertaIncidentes"
    | "backupAtivo"
  >
>;

const fetcher = async (url: string): Promise<SuperAdminConfig> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Falha ao carregar configuracoes globais");
  }
  return response.json();
};

export function useSuperAdminConfig() {
  const apiState = useApiState();
  const { data, error, isLoading, mutate } = useSWR<SuperAdminConfig>(
    "/api/superadmin/config",
    fetcher
  );

  const updateConfig = async (payload: ConfigPayload) => {
    return apiState.handleAsync(async () => {
      const response = await fetch("/api/superadmin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details.error ?? "Falha ao salvar configuracoes");
      }

      await mutate();
      return response.json().catch(() => null);
    });
  };

  return {
    data,
    error,
    isLoading: isLoading || apiState.isLoading,
    updateConfig,
    mutate,
    apiState,
  };
}
