import useSWR from "swr";
import type { TimeDoDia } from "@/types/partida";

export type TimesDoDiaConfronto = {
  id: string;
  ordem?: number;
  tempo?: number;
  turno?: "ida" | "volta";
  timeA: string;
  timeB: string;
};

export type TimesDoDiaLocal = {
  nome?: string;
  endereco?: string;
  mapa?: string;
  observacoes?: string;
};

export type TimesDoDiaPublicado = {
  id?: string;
  publicado?: boolean;
  publicadoEm?: string;
  configuracao?: {
    duracaoRachaMin?: number;
    duracaoPartidaMin?: number;
    numTimes?: number;
    jogadoresPorTime?: number;
  };
  times?: TimeDoDia[];
  confrontos?: TimesDoDiaConfronto[];
  curtidas?: number;
  local?: TimesDoDiaLocal;
};

type Options = {
  slug?: string;
  source?: "public" | "admin";
  enabled?: boolean;
};

const fetcher = async (url: string): Promise<TimesDoDiaPublicado | null> => {
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || "Falha ao buscar times do dia");
  }
  return res.json();
};

export function useTimesDoDiaPublicado(options: Options = {}) {
  const enabled = options.enabled ?? true;
  const source = options.source ?? "public";
  const slug = options.slug;

  const key =
    enabled && source === "admin"
      ? "/api/sorteio/publicado"
      : enabled && slug
        ? `/api/public/${slug}/times-do-dia`
        : null;

  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data,
    isLoading: enabled ? isLoading : false,
    isError: Boolean(error),
    error,
    mutate,
  };
}
