import useSWR from "swr";

import type { Atleta, AtletaDetalhe } from "@/types/atleta";

type AtletasResponse = {
  resultados: Atleta[];
};

type AtletaDetalheResponse = {
  atleta: AtletaDetalhe;
};

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload && typeof payload.error === "string" ? payload.error : "Falha ao carregar atletas";
    throw new Error(message);
  }

  return payload;
};

function buildQuery(rachaId?: string | null, tenantSlug?: string | null): string | null {
  if (rachaId) {
    return `rachaId=${encodeURIComponent(rachaId)}`;
  }

  if (tenantSlug) {
    return `slug=${encodeURIComponent(tenantSlug)}`;
  }

  return null;
}

function buildDetalheQuery(rachaId?: string | null, tenantSlug?: string | null): string | null {
  if (rachaId) {
    return `rachaId=${encodeURIComponent(rachaId)}`;
  }

  if (tenantSlug) {
    return `tenant=${encodeURIComponent(tenantSlug)}`;
  }

  return null;
}

export function useAtletas(rachaId?: string | null, tenantSlug?: string | null) {
  const query = buildQuery(rachaId, tenantSlug);
  const key = query ? `/api/atletas?${query}` : null;

  const { data, error, isLoading, mutate } = useSWR<AtletasResponse>(key, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    atletas: data?.resultados ?? [],
    isLoading,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}

export function useAtletaDetalhe(
  atletaSlug: string | null | undefined,
  rachaId?: string | null,
  tenantSlug?: string | null
) {
  const query = buildDetalheQuery(rachaId, tenantSlug);
  const key = atletaSlug && query ? `/api/atletas/${encodeURIComponent(atletaSlug)}?${query}` : null;

  const { data, error, isLoading, mutate } = useSWR<AtletaDetalheResponse>(key, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    atleta: data?.atleta ?? null,
    isLoading,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}
