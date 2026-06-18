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

const readMutationError = async (res: Response, fallback: string) => {
  const text = await res.text().catch(() => "");
  if (!text) return fallback;
  try {
    const data = JSON.parse(text);
    const message = data?.message || data?.error;
    if (!message || message === "Bad Request") return fallback;
    return message;
  } catch {
    if (text.trim() === "Bad Request") return fallback;
    return text || fallback;
  }
};

const buildTorneioMutationPayload = (torneio: Partial<Torneio> & Record<string, unknown>) => {
  const {
    id,
    rachaId,
    tenantId,
    tenantSlug,
    criadoEm,
    atualizadoEm,
    premioTotal,
    premioMvp,
    ...payload
  } = torneio;
  return payload;
};

export function useTorneios(slug?: string) {
  const search = slug ? `?slug=${encodeURIComponent(slug)}` : "";
  const key = slug ? `/api/admin/torneios${search}` : null;

  const { data, error, mutate } = useSWR<TorneiosResponse>(key, fetcher);

  async function addTorneio(torneio: Partial<Torneio>) {
    const res = await fetch("/api/admin/torneios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildTorneioMutationPayload(torneio)),
    });
    if (!res.ok) {
      throw new Error(
        await readMutationError(
          res,
          "Nao foi possivel cadastrar o torneio. Revise os campos e tente novamente."
        )
      );
    }
    await mutate();
  }

  async function updateTorneio(torneio: Partial<Torneio> & { id: string }) {
    const res = await fetch(`/api/admin/torneios/${torneio.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildTorneioMutationPayload(torneio)),
    });
    if (!res.ok) {
      throw new Error(
        await readMutationError(
          res,
          "Nao foi possivel atualizar o torneio. Revise os campos e tente novamente."
        )
      );
    }
    await mutate();
  }

  async function deleteTorneio(id: string) {
    const query = slug ? `?slug=${encodeURIComponent(slug)}` : "";
    const res = await fetch(`/api/admin/torneios/${id}${query}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error(await readMutationError(res, "Falha ao excluir torneio."));
    }
    await mutate();
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
