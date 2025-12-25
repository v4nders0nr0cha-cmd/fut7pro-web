import useSWR from "swr";
import type { Torneio } from "@/types/torneio";

type TorneiosResponse = {
  results?: Torneio[];
  total?: number;
  page?: number;
  limit?: number;
};

const fetcher = async (url: string): Promise<TorneiosResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    const message = await res.text().catch(() => "");
    throw new Error(message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  if (Array.isArray(data)) {
    return { results: data, total: data.length, page: 1, limit: data.length };
  }
  return data || { results: [], total: 0, page: 1, limit: 0 };
};

export function useTorneios(slug?: string) {
  const search = slug ? `?slug=${encodeURIComponent(slug)}` : "";
  const key = slug ? `/api/admin/torneios${search}` : null;

  const { data, error, mutate } = useSWR<TorneiosResponse>(key, fetcher);

  async function addTorneio(torneio: Partial<Torneio>) {
    await fetch("/api/admin/torneios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...torneio, slug }),
    });
    mutate();
  }

  async function updateTorneio(torneio: Partial<Torneio> & { id: string }) {
    await fetch(`/api/admin/torneios/${torneio.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...torneio, slug }),
    });
    mutate();
  }

  async function deleteTorneio(id: string) {
    const query = slug ? `?slug=${encodeURIComponent(slug)}` : "";
    await fetch(`/api/admin/torneios/${id}${query}`, {
      method: "DELETE",
    });
    mutate();
  }

  return {
    torneios: data?.results ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? 0,
    isLoading: !error && !data,
    isError: !!error,
    addTorneio,
    updateTorneio,
    deleteTorneio,
    mutate,
  };
}
