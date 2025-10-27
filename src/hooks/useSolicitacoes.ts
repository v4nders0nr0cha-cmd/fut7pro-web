"use client";

import useSWR from "swr";

type Solicitacao = {
  id: string;
  nome: string;
  apelido: string | null;
  email: string;
  posicao: string;
  fotoUrl: string | null;
  status: string;
  criadoEm: string;
};

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Erro ao carregar solicitações");
  return res.json();
};

export function useSolicitacoes(
  status: "PENDENTE" | "APROVADA" | "REJEITADA" | "TODAS" = "PENDENTE"
) {
  const query = status === "TODAS" ? "" : `?status=${encodeURIComponent(status)}`;
  const { data, error, isLoading, mutate } = useSWR<Solicitacao[]>(
    `/api/admin/solicitacoes${query}`,
    fetcher
  );
  return {
    solicitacoes: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

export function useSolicitacoesCount() {
  const { data } = useSWR<{ count: number }>(
    `/api/admin/solicitacoes?status=PENDENTE&count=1`,
    fetcher
  );
  return data?.count ?? 0;
}
