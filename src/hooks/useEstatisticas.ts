import useSWR from "swr";
import { useTenant } from "@/hooks/useTenant";
import { rachaConfig } from "@/config/racha.config";
import type { RankingAtleta, TimeClassificacao } from "@/types/estatisticas";

interface RankingResponse<T> {
  results: T[];
  updatedAt?: string | null;
  periodo?: string;
  ano?: number | null;
  availableYears?: number[];
  fallback?: boolean;
  error?: string;
}

interface RankingOptions {
  ano?: number;
  periodo?: string;
  limit?: number;
  position?: string;
}

type RankingFetcher<T> = RankingResponse<T>;

type BaseResult<T> = {
  resultados: T[];
  atualizadoEm: string | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  availableYears: number[];
};

async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload && typeof payload.error === "string"
        ? payload.error
        : "Erro ao carregar estatísticas";
    throw new Error(message);
  }
  return payload as T;
}

function buildPublicEndpoint(
  endpoint: string,
  slug: string,
  periodo: string,
  options?: RankingOptions
) {
  const params = new URLSearchParams();
  params.set("slug", slug);
  params.set("periodo", options?.periodo ?? periodo);
  if (typeof options?.ano === "number" && Number.isFinite(options.ano)) {
    params.set("ano", String(options.ano));
  }
  if (typeof options?.limit === "number" && Number.isFinite(options.limit)) {
    params.set("limit", String(options.limit));
  }
  if (options?.position) {
    params.set("position", options.position);
  }

  switch (endpoint) {
    case "/api/estatisticas/ranking-geral":
      params.set("type", "geral");
      return `/api/public/player-rankings?${params.toString()}`;
    case "/api/estatisticas/artilheiros":
      params.set("type", "artilheiros");
      return `/api/public/player-rankings?${params.toString()}`;
    case "/api/estatisticas/assistencias":
      params.set("type", "assistencias");
      return `/api/public/player-rankings?${params.toString()}`;
    case "/api/estatisticas/classificacao":
      return `/api/public/team-rankings?${params.toString()}`;
    default:
      return null;
  }
}

function useRankingEndpoint<T>(
  endpoint: string,
  periodo: string,
  options?: RankingOptions
): BaseResult<T> {
  const { tenant } = useTenant();
  const slug = tenant?.slug || rachaConfig.slug;

  const key = buildPublicEndpoint(endpoint, slug, periodo, options);
  const shouldFetch = Boolean(key);

  const { data, error, isLoading } = useSWR<RankingFetcher<T>>(
    shouldFetch ? key : null,
    fetcher
  );

  return {
    resultados: data?.results ?? [],
    atualizadoEm: data?.updatedAt ?? null,
    isLoading,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    availableYears: data?.availableYears ?? [],
  };
}

export function useRankingGeral(periodo: string, options?: RankingOptions) {
  return useRankingEndpoint<RankingAtleta>("/api/estatisticas/ranking-geral", periodo, options);
}

export function useRankingArtilheiros(periodo: string, options?: RankingOptions) {
  return useRankingEndpoint<RankingAtleta>("/api/estatisticas/artilheiros", periodo, options);
}

export function useRankingAssistencias(periodo: string, options?: RankingOptions) {
  return useRankingEndpoint<RankingAtleta>("/api/estatisticas/assistencias", periodo, options);
}

export function useClassificacaoTimes(periodo: string, options?: RankingOptions) {
  return useRankingEndpoint<TimeClassificacao>("/api/estatisticas/classificacao", periodo, options);
}
