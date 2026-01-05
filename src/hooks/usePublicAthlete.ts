"use client";

import useSWR from "swr";
import type { PublicAthleteProfile, PublicAthleteResponse } from "@/types/public-athlete";

const fetcher = async (url: string): Promise<PublicAthleteResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(body || "Falha ao carregar atleta") as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.json();
};

type PublicAthleteListEntry = {
  id: string;
  slug: string | null;
  nome: string;
  apelido?: string | null;
  position?: string | null;
  positionSecondary?: string | null;
  posicao?: string | null;
  posicaoSecundaria?: string | null;
  foto?: string | null;
  status?: string | null;
  mensalista?: boolean | null;
};

type PublicAthletesResponse = {
  slug: string;
  results: PublicAthleteListEntry[];
  total: number;
  updatedAt?: string | null;
};

const listFetcher = async (url: string): Promise<PublicAthletesResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Falha ao carregar atletas");
  }
  return res.json();
};

export function usePublicAthlete(options: {
  tenantSlug?: string;
  athleteSlug?: string;
  enabled?: boolean;
}) {
  const enabled = options.enabled ?? true;
  const tenantSlug = options.tenantSlug?.trim();
  const athleteSlug = options.athleteSlug?.trim();
  const key =
    enabled && tenantSlug && athleteSlug
      ? `/api/public/${encodeURIComponent(tenantSlug)}/athletes/${encodeURIComponent(athleteSlug)}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<PublicAthleteResponse>(key, fetcher, {
    revalidateOnFocus: false,
  });

  const status = (error as { status?: number } | null)?.status;
  const isNotFound = status === 404;
  const listKey =
    isNotFound && tenantSlug ? `/api/public/${encodeURIComponent(tenantSlug)}/athletes` : null;
  const { data: listData, isLoading: isLoadingList } = useSWR<PublicAthletesResponse>(
    listKey,
    listFetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const fallbackEntry = listData?.results.find(
    (entry) => entry.slug === athleteSlug || entry.id === athleteSlug
  );
  const fallbackAthlete: PublicAthleteProfile | null = fallbackEntry
    ? {
        id: fallbackEntry.id,
        slug: fallbackEntry.slug ?? athleteSlug ?? fallbackEntry.id,
        firstName: fallbackEntry.nome,
        nickname: fallbackEntry.apelido ?? null,
        position: fallbackEntry.position ?? fallbackEntry.posicao ?? null,
        positionSecondary:
          fallbackEntry.positionSecondary ?? fallbackEntry.posicaoSecundaria ?? null,
        avatarUrl: fallbackEntry.foto ?? null,
        status: fallbackEntry.status ?? null,
        mensalista: fallbackEntry.mensalista ?? null,
        adminRole: null,
      }
    : null;

  const resolvedAthlete = data?.athlete ?? fallbackAthlete;
  const resolvedConquistas = data?.conquistas ?? {
    titulosGrandesTorneios: [],
    titulosAnuais: [],
    titulosQuadrimestrais: [],
  };

  return {
    athlete: resolvedAthlete,
    conquistas: resolvedConquistas,
    slug: data?.slug ?? tenantSlug ?? "",
    isLoading: isLoading || (isNotFound && isLoadingList),
    isError: Boolean(error) && !isNotFound,
    isNotFound,
    error: error instanceof Error && !isNotFound ? error.message : null,
    mutate,
  };
}
