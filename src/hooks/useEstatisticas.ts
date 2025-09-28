import useSWR from 'swr';
import { useRacha } from '@/context/RachaContext';
import type { RankingAtleta, TimeClassificacao } from '@/types/estatisticas';

interface RankingResponse<T> {
  results: T[];
  updatedAt?: string;
  periodo?: string;
  ano?: number | null;
  availableYears?: number[];
}

interface RankingOptions {
  ano?: number;
  periodo?: string;
}

type RankingFetcher<T> = RankingResponse<T>;

type EndpointConfig = {
  endpoint: string;
  periodo: string;
  ano?: number;
};

type BaseResult<T> = {
  resultados: T[];
  atualizadoEm: string | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  availableYears: number[];
};

async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'no-store' });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && typeof payload.error === 'string' ? payload.error : 'Erro ao carregar estatisticas';
    throw new Error(message);
  }
  return payload as T;
}

function createKey(rachaId: string | null, config: EndpointConfig) {
  if (!rachaId) return null;
  const params = new URLSearchParams();
  params.set('rachaId', rachaId);
  params.set('periodo', config.periodo);
  if (typeof config.ano === 'number' && Number.isFinite(config.ano)) {
    params.set('ano', String(config.ano));
  }
  return `${config.endpoint}?${params.toString()}`;
}

function useRankingEndpoint<T>(endpoint: string, periodo: string, options?: RankingOptions): BaseResult<T> {
  const { rachaId } = useRacha();
  const key = createKey(rachaId ?? null, {
    endpoint,
    periodo,
    ano: options?.ano,
  });

  const { data, error, isLoading } = useSWR<RankingFetcher<T>>(key, fetcher);

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
  return useRankingEndpoint<RankingAtleta>('/api/estatisticas/ranking-geral', periodo, options);
}

export function useRankingArtilheiros(periodo: string, options?: RankingOptions) {
  return useRankingEndpoint<RankingAtleta>('/api/estatisticas/artilheiros', periodo, options);
}

export function useRankingAssistencias(periodo: string, options?: RankingOptions) {
  return useRankingEndpoint<RankingAtleta>('/api/estatisticas/assistencias', periodo, options);
}

export function useClassificacaoTimes(periodo: string, options?: RankingOptions) {
  return useRankingEndpoint<TimeClassificacao>('/api/estatisticas/classificacao', periodo, options);
}
