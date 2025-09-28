import useSWR from 'swr';
import type { SuperadminUsuariosSnapshot } from '@/types/superadmin';

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    const message = await response.text().catch(() => 'Erro ao carregar usuarios');
    throw new Error(message || 'Erro ao carregar usuarios');
  }
  return response.json();
};

const emptySnapshot: SuperadminUsuariosSnapshot = {
  total: 0,
  ativos: 0,
  porRole: {},
  itens: [],
};

export function useSuperadminUsuarios() {
  const { data, error, isLoading, mutate } = useSWR<SuperadminUsuariosSnapshot>(
    '/api/superadmin/usuarios',
    fetcher,
    { revalidateOnFocus: false }
  );

  const snapshot = data ?? emptySnapshot;

  return {
    usuarios: snapshot.itens,
    snapshot,
    isLoading,
    error,
    refresh: mutate,
  };
}
