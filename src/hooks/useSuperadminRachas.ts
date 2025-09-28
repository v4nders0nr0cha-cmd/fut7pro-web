import useSWR from 'swr';
import type { SuperadminRachaResumo } from '@/types/superadmin';

interface ResponsePayload {
  itens: SuperadminRachaResumo[];
}

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    const message = await response.text().catch(() => 'Erro ao carregar rachas');
    throw new Error(message || 'Erro ao carregar rachas');
  }
  return response.json();
};

export function useSuperadminRachas() {
  const { data, error, isLoading, mutate } = useSWR<ResponsePayload>('/api/superadmin/rachas', fetcher, {
    revalidateOnFocus: false,
  });

  return {
    rachas: data?.itens ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}
