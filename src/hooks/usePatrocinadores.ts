import useSWR from "swr";
import { useApiState } from "./useApiState";
import type { Patrocinador, PatrocinadorPayload } from "@/types/patrocinador";
import { normalizeSponsor } from "@/lib/normalize-sponsor";

const JSON_CT = "application/json";

async function fetcher(url: string): Promise<Patrocinador[]> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: { Accept: JSON_CT },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error ?? "Erro ao carregar patrocinadores");
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(normalizeSponsor);
}

export function usePatrocinadores(tenantSlug: string | null | undefined) {
  const apiState = useApiState();
  const key = tenantSlug ? `/api/admin/patrocinadores?slug=${tenantSlug}` : null;

  const { data, error, isLoading, mutate } = useSWR<Patrocinador[]>(key, fetcher, {
    revalidateOnFocus: false,
    onError: (err) => {
      if (process.env.NODE_ENV === "development") {
        console.warn("Erro ao carregar patrocinadores:", err);
      }
    },
  });

  const createPatrocinador = async (
    payload: PatrocinadorPayload,
    options?: { revalidate?: boolean }
  ) => {
    if (!tenantSlug) return null;

    return apiState.handleAsync(async () => {
      const response = await fetch(`/api/admin/patrocinadores?slug=${tenantSlug}`, {
        method: "POST",
        headers: { "Content-Type": JSON_CT },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? "Erro ao criar patrocinador");
      }

      if (options?.revalidate !== false) {
        await mutate();
      }
      return response
        .json()
        .then(normalizeSponsor)
        .catch(() => null);
    });
  };

  const updatePatrocinador = async (
    id: string,
    payload: PatrocinadorPayload,
    options?: { revalidate?: boolean }
  ) => {
    if (!tenantSlug) return null;

    return apiState.handleAsync(async () => {
      const response = await fetch(`/api/admin/patrocinadores?slug=${tenantSlug}`, {
        method: "PUT",
        headers: { "Content-Type": JSON_CT },
        body: JSON.stringify({ id, ...payload }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? "Erro ao atualizar patrocinador");
      }

      if (options?.revalidate !== false) {
        await mutate();
      }
      return response
        .json()
        .then(normalizeSponsor)
        .catch(() => null);
    });
  };

  const deletePatrocinador = async (id: string, options?: { revalidate?: boolean }) => {
    if (!tenantSlug) return null;

    return apiState.handleAsync(async () => {
      const response = await fetch(
        `/api/admin/patrocinadores?slug=${tenantSlug}&id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: { Accept: JSON_CT },
        }
      );

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? "Erro ao excluir patrocinador");
      }

      if (options?.revalidate !== false) {
        await mutate();
      }
      return null;
    });
  };

  const toggleFooterVisibility = async (id: string, show: boolean) => {
    return updatePatrocinador(id, { showOnFooter: show });
  };

  const toggleFooterForAll = async (show: boolean) => {
    const sponsors = data ?? [];
    if (!sponsors.length) return;

    await Promise.all(
      sponsors.map((s) => updatePatrocinador(s.id, { showOnFooter: show }, { revalidate: false }))
    );
    await mutate();
  };

  return {
    patrocinadores: data ?? [],
    isLoading: isLoading || apiState.isLoading,
    isError: !!error || apiState.isError,
    error: error?.message ?? apiState.error,
    isSuccess: apiState.isSuccess,
    createPatrocinador,
    updatePatrocinador,
    deletePatrocinador,
    toggleFooterVisibility,
    toggleFooterForAll,
    mutate,
    resetState: apiState.reset,
  };
}
