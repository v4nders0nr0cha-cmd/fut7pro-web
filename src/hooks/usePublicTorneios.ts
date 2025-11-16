"use client";

import useSWR from "swr";
import { usePublicTenantSlug } from "./usePublicTenantSlug";
import type { Torneio } from "@/types/torneio";

function normalizeTorneio(raw: any): Torneio {
  return {
    id: String(raw?.id ?? raw?.torneioId ?? ""),
    nome: raw?.nome ?? raw?.title ?? "Torneio",
    slug: raw?.slug ?? "",
    ano: Number(raw?.ano ?? raw?.year ?? new Date().getFullYear()),
    campeao: raw?.campeao ?? raw?.champion ?? null,
    descricao: raw?.descricao ?? raw?.description ?? null,
    descricaoResumida: raw?.descricaoResumida ?? raw?.descricaoShort ?? raw?.descricaoCurta ?? null,
    bannerUrl: raw?.bannerUrl ?? raw?.banner ?? null,
    logoUrl: raw?.logoUrl ?? raw?.logo ?? null,
    dataInicio: raw?.dataInicio ?? raw?.startDate ?? null,
    dataFim: raw?.dataFim ?? raw?.endDate ?? null,
    destacarNoSite: Boolean(raw?.destacarNoSite),
    status: raw?.status,
    publicadoEm: raw?.publicadoEm ?? null,
    jogadoresCampeoes: Array.isArray(raw?.jogadoresCampeoes)
      ? raw.jogadoresCampeoes.map((j: any) => ({
          id: j?.id,
          athleteId: j?.athleteId ?? null,
          athleteSlug: j?.athleteSlug ?? j?.slug ?? "",
          nome: j?.nome ?? j?.name ?? "",
          posicao: j?.posicao ?? j?.position ?? "",
          fotoUrl: j?.fotoUrl ?? j?.photoUrl ?? null,
        }))
      : [],
  };
}

const fetcher = async (url: string): Promise<Torneio[]> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Falha ao carregar torneios");
  }
  const payload = await res.json();
  const items = Array.isArray(payload?.results)
    ? payload.results
    : Array.isArray(payload)
      ? payload
      : [];
  return items.map(normalizeTorneio);
};

const fetchOne = async (url: string): Promise<Torneio | null> => {
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error("Falha ao carregar torneio");
  }
  const payload = await res.json();
  return normalizeTorneio(payload);
};

export function usePublicTorneios(tenantSlug?: string | null) {
  const resolved = tenantSlug ?? usePublicTenantSlug();
  const key = resolved ? `/api/public/${resolved}/torneios` : null;
  const { data, error, isLoading } = useSWR<Torneio[]>(key, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    torneios: data ?? [],
    isLoading: isLoading ?? false,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
  };
}

export function usePublicTorneio(torneioSlug: string | null, tenantSlug?: string | null) {
  const resolved = tenantSlug ?? usePublicTenantSlug();
  const key = resolved && torneioSlug ? `/api/public/${resolved}/torneios/${torneioSlug}` : null;
  const { data, error, isLoading } = useSWR<Torneio | null>(key, fetchOne, {
    revalidateOnFocus: false,
  });

  return {
    torneio: data,
    isLoading: isLoading ?? false,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
  };
}
