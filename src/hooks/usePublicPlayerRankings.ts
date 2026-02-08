"use client";

import useSWR from "swr";
import { rachaConfig } from "@/config/racha.config";
import type { RankingAtleta } from "@/types/estatisticas";

type PlayerRankingType = "geral" | "artilheiros" | "assistencias";
type PlayerRankingPeriod = "all" | "year" | "quarter" | "custom";

interface PlayerRankingsResponse {
  slug: string;
  type: PlayerRankingType;
  results: RankingAtleta[];
  total: number;
  availableYears?: number[];
  appliedPeriod?: Record<string, unknown> | null;
}

interface PublicAthleteEntry {
  id: string;
  slug: string | null;
  nome: string;
  apelido?: string | null;
  posicao?: string | null;
  position?: string | null;
  foto?: string | null;
  avatarUrl?: string | null;
  status?: string | null;
  mensalista?: boolean | null;
}

interface PublicAthletesResponse {
  slug: string;
  results: PublicAthleteEntry[];
  total: number;
  updatedAt?: string | null;
}

const fetcher = async (url: string): Promise<PlayerRankingsResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Erro ao carregar rankings de jogadores");
  }
  return res.json();
};

const athletesFetcher = async (url: string): Promise<PublicAthletesResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Erro ao carregar atletas do racha");
  }
  return res.json();
};

const DEFAULT_AVATAR = "/images/jogadores/jogador_padrao_01.jpg";

function normalizePosition(value?: string | null) {
  if (!value) return "";
  const cleaned = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (cleaned.startsWith("gol")) return "goleiro";
  if (cleaned.startsWith("zag")) return "zagueiro";
  if (cleaned.startsWith("mei")) return "meia";
  if (cleaned.startsWith("ata")) return "atacante";
  return cleaned;
}

function resolvePositionLabel(value?: string | null) {
  const normalized = normalizePosition(value);
  switch (normalized) {
    case "goleiro":
      return "Goleiro";
    case "zagueiro":
      return "Zagueiro";
    case "meia":
      return "Meia";
    case "atacante":
      return "Atacante";
    default:
      return value ?? "";
  }
}

function resolveAthleteSlug(slug: string | null | undefined, id: string) {
  const trimmed = typeof slug === "string" ? slug.trim() : "";
  return trimmed.length > 0 ? trimmed : id;
}

export interface UsePublicPlayerRankingsOptions {
  slug?: string;
  type: PlayerRankingType;
  period?: PlayerRankingPeriod;
  year?: number;
  quarter?: number;
  limit?: number;
  position?: string;
}

export function usePublicPlayerRankings(options: UsePublicPlayerRankingsOptions) {
  const slug = options.slug ?? rachaConfig.slug;
  const athletesKey = slug ? `/api/public/${slug}/athletes` : null;

  const { data: athletesData, isLoading: athletesLoading } = useSWR<PublicAthletesResponse>(
    athletesKey,
    athletesFetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const resolvedLimit =
    options.limit ??
    (athletesData?.total && athletesData.total > 0 ? athletesData.total : undefined);

  const params = new URLSearchParams();
  params.set("type", options.type);
  if (options.period) params.set("period", options.period);
  if (options.year) params.set("year", String(options.year));
  if (options.quarter) params.set("quarter", String(options.quarter));
  if (resolvedLimit) params.set("limit", String(resolvedLimit));
  if (options.position) params.set("position", options.position);

  const key = slug ? `/api/public/${slug}/player-rankings?${params.toString()}` : null;

  const { data, error, isLoading } = useSWR<PlayerRankingsResponse>(key, fetcher, {
    revalidateOnFocus: false,
  });

  const rankingResults = data?.results ?? [];
  const normalizedRankings = rankingResults.map((entry) => {
    const avatarUrl = entry.avatarUrl ?? entry.foto ?? DEFAULT_AVATAR;
    return {
      ...entry,
      foto: avatarUrl,
      avatarUrl,
      slug: resolveAthleteSlug(entry.slug, entry.id),
    };
  });
  const athleteResults = athletesData?.results ?? [];
  const positionFilter = normalizePosition(options.position);

  const filteredAthletes = positionFilter
    ? athleteResults.filter(
        (athlete) => normalizePosition(athlete.posicao ?? athlete.position) === positionFilter
      )
    : athleteResults;

  const rankingIds = new Set(normalizedRankings.map((entry) => entry.id));
  const missingAthletes = filteredAthletes
    .filter((athlete) => !rankingIds.has(athlete.id))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  const zeroEntries: RankingAtleta[] = missingAthletes.map((athlete) => ({
    id: athlete.id,
    nome: athlete.nome,
    slug: resolveAthleteSlug(athlete.slug, athlete.id),
    foto:
      athlete.avatarUrl && athlete.avatarUrl.trim()
        ? athlete.avatarUrl
        : athlete.foto && athlete.foto.trim()
          ? athlete.foto
          : DEFAULT_AVATAR,
    avatarUrl: athlete.avatarUrl ?? athlete.foto ?? DEFAULT_AVATAR,
    posicao: resolvePositionLabel(athlete.posicao ?? athlete.position),
    position: normalizePosition(athlete.posicao ?? athlete.position) || undefined,
    pontos: 0,
    jogos: 0,
    vitorias: 0,
    empates: 0,
    derrotas: 0,
    gols: 0,
    assistencias: 0,
  }));

  const mergedRankings = [...normalizedRankings, ...zeroEntries];
  const limitedRankings = options.limit ? mergedRankings.slice(0, options.limit) : mergedRankings;
  const shouldWaitAthletes = !rankingResults.length && athletesLoading;
  const loading = isLoading || shouldWaitAthletes;

  return {
    rankings: limitedRankings,
    total: limitedRankings.length,
    slug: data?.slug,
    type: data?.type,
    availableYears: data?.availableYears ?? [],
    appliedPeriod: data?.appliedPeriod ?? null,
    isLoading: loading,
    isError: !!error,
    error: error instanceof Error ? error.message : null,
  };
}
