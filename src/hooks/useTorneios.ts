import useSWR from "swr";
import type { Torneio } from "@/types/torneio";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTorneios(slug?: string) {
  const search = slug ? `?slug=${encodeURIComponent(slug)}` : "";
  const key = slug ? `/api/admin/torneios${search}` : null;

  const { data, error, mutate } = useSWR<Torneio[]>(key, fetcher);

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
    torneios: data || [],
    isLoading: !error && !data,
    isError: !!error,
    addTorneio,
    updateTorneio,
    deleteTorneio,
    mutate,
  };
}
