import useSWR from "swr";
import type { Torneio } from "@/types/torneio";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTorneios(rachaId: string) {
  const { data, error, mutate } = useSWR<Torneio[]>(
    rachaId ? `/api/admin/rachas/${rachaId}/torneios` : null,
    fetcher,
  );

  async function addTorneio(torneio: Partial<Torneio>) {
    await fetch(`/api/admin/rachas/${rachaId}/torneios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(torneio),
    });
    mutate();
  }

  async function updateTorneio(torneio: Torneio) {
    await fetch(`/api/admin/rachas/${rachaId}/torneios/${torneio.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(torneio),
    });
    mutate();
  }

  async function deleteTorneio(id: string) {
    await fetch(`/api/admin/rachas/${rachaId}/torneios/${id}`, {
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
