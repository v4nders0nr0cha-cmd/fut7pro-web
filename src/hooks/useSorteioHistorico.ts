"use client";

import useSWR from "swr";
import type { SorteioHistoricoResponse } from "@/types/sorteio";

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Erro ao buscar historico do sorteio");
  }
  return res.json();
};

export function useSorteioHistorico(limit = 5) {
  const key = `/api/sorteio/historico?limit=${limit}`;

  const { data, error, isLoading } = useSWR<SorteioHistoricoResponse>(key, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    historico: data?.historico ?? [],
    totalTemporada: data?.totalTemporada ?? null,
    anoTemporada: data?.anoTemporada ?? null,
    isLoading: isLoading || (!data && !error),
    isError: !!error,
  };
}
