import useSWR from "swr";
import type { Patrocinador } from "@/types/patrocinador"; // <-- Corrigido!

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function usePatrocinadores(rachaId: string) {
  const { data, error, mutate } = useSWR<Patrocinador[]>(
    `/api/admin/patrocinadores?rachaId=${rachaId}`,
    fetcher
  );

  async function addPatrocinador(p: Partial<Patrocinador>) {
    await fetch("/api/admin/patrocinadores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
    mutate();
  }

  async function updatePatrocinador(p: Patrocinador) {
    await fetch(`/api/admin/patrocinadores/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
    mutate();
  }

  async function deletePatrocinador(id: string) {
    await fetch(`/api/admin/patrocinadores/${id}`, { method: "DELETE" });
    mutate();
  }

  return {
    patrocinadores: data || [],
    isLoading: !error && !data,
    isError: !!error,
    addPatrocinador,
    updatePatrocinador,
    deletePatrocinador,
    mutate,
  };
}
