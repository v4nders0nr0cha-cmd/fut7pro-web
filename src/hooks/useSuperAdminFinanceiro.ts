"use client";

import useSWR from "swr";

export type SuperAdminFinanceiroResumo = {
  receitaTotal: number;
  mrr: number;
  arr: number;
  ticketMedio: number;
  churn: number;
  ativos: number;
  inadimplentes: number;
};

export type SuperAdminFinanceiroPlano = {
  key: string;
  nome: string;
  tipo: string;
  ativos: number;
  receita: number;
  inadimplentes: number;
  vencimentos: number;
};

export type SuperAdminFinanceiroRacha = {
  id: string;
  nome: string;
  slug: string;
  presidente: string;
  plano: string;
  status: string;
  valor: number;
  vencimento: string | null;
  contato?: string | null;
};

export type SuperAdminFinanceiroResponse = {
  resumo: SuperAdminFinanceiroResumo;
  porPlano: SuperAdminFinanceiroPlano[];
  graficoReceita: Array<{ mes: string; receita: number }>;
  rachas: SuperAdminFinanceiroRacha[];
  inadimplentes: SuperAdminFinanceiroRacha[];
};

const fetcher = async (url: string): Promise<SuperAdminFinanceiroResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Falha ao carregar dados financeiros do SuperAdmin");
  }
  return response.json();
};

export function useSuperAdminFinanceiro() {
  const { data, error, isLoading, mutate } = useSWR<SuperAdminFinanceiroResponse>(
    "/api/superadmin/financeiro",
    fetcher
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
