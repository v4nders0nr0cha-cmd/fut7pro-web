import useSWR from 'swr';
import type { SuperadminTicketsSnapshot } from '@/types/superadmin';

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    const message = await response.text().catch(() => 'Erro ao carregar tickets');
    throw new Error(message || 'Erro ao carregar tickets');
  }
  return response.json();
};

const emptySnapshot: SuperadminTicketsSnapshot = {
  total: 0,
  abertos: 0,
  emAndamento: 0,
  resolvidos: 0,
  itens: [],
};

export function useSuperadminTickets() {
  const { data, error, isLoading, mutate } = useSWR<SuperadminTicketsSnapshot>(
    '/api/superadmin/tickets',
    fetcher,
    { revalidateOnFocus: false }
  );

  const snapshot = data ?? emptySnapshot;

  return {
    tickets: snapshot.itens,
    snapshot,
    isLoading,
    error,
    refresh: mutate,
  };
}
