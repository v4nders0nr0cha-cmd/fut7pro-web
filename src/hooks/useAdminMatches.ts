"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { useRacha } from "@/context/RachaContext";
import type { PublicMatch, PublicMatchPresence, PublicMatchTeam } from "@/types/partida";

type AdminMatchesOptions = {
  enabled?: boolean;
};

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || "Falha ao buscar partidas do admin");
  }
  return response.json();
};

function toIso(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" && value.length > 0) return value;
  return null;
}

function mapTeam(team: any, fallbackId: string, fallbackName: string): PublicMatchTeam {
  if (team && typeof team === "object") {
    return {
      id: team.id ?? fallbackId,
      name: team.name ?? fallbackName,
      logoUrl: team.logoUrl ?? null,
      color: team.color ?? null,
    };
  }
  if (typeof team === "string") {
    return { id: fallbackId, name: team, logoUrl: null, color: null };
  }
  return { id: fallbackId, name: fallbackName, logoUrl: null, color: null };
}

function mapPresence(presence: any, fallbackMatchId: string, index: number): PublicMatchPresence {
  const athlete = presence?.athlete ?? null;
  const team = presence?.team ?? null;
  return {
    id: presence?.id ?? `${fallbackMatchId}-presence-${index}`,
    matchId: presence?.matchId ?? fallbackMatchId,
    tenantId: presence?.tenantId ?? null,
    athleteId: presence?.athleteId ?? athlete?.id ?? "",
    teamId: presence?.teamId ?? team?.id ?? null,
    status: presence?.status ?? "AUSENTE",
    goals: Number(presence?.goals ?? 0),
    assists: Number(presence?.assists ?? 0),
    yellowCards: Number(presence?.yellowCards ?? 0),
    redCards: Number(presence?.redCards ?? 0),
    createdAt: toIso(presence?.createdAt) ?? toIso(presence?.updatedAt) ?? "",
    updatedAt: toIso(presence?.updatedAt) ?? toIso(presence?.createdAt) ?? "",
    athlete: athlete
      ? {
          id: athlete.id,
          name: athlete.name,
          nickname: athlete.nickname ?? null,
          position: athlete.position ?? null,
          photoUrl: athlete.photoUrl ?? null,
        }
      : null,
    team: team
      ? {
          id: team.id ?? null,
          name: team.name ?? "",
          logoUrl: team.logoUrl ?? null,
          color: team.color ?? null,
        }
      : null,
  };
}

function normalizeMatch(raw: any): PublicMatch {
  const rawDate = raw?.date ?? raw?.data ?? raw?.createdAt ?? new Date().toISOString();
  const date = toIso(rawDate) ?? new Date().toISOString();
  const teamA = mapTeam(raw?.teamA ?? raw?.timeA, raw?.teamAId ?? `${raw?.id}-a`, "Time A");
  const teamB = mapTeam(raw?.teamB ?? raw?.timeB, raw?.teamBId ?? `${raw?.id}-b`, "Time B");
  const scoreA = Number.isFinite(raw?.scoreA) ? Number(raw.scoreA) : Number(raw?.golsTimeA ?? 0);
  const scoreB = Number.isFinite(raw?.scoreB) ? Number(raw.scoreB) : Number(raw?.golsTimeB ?? 0);
  const presences = Array.isArray(raw?.presences)
    ? raw.presences.map((presence: any, index: number) =>
        mapPresence(presence, raw?.id ?? "match", index)
      )
    : [];

  return {
    id: raw?.id ?? `match-${date}`,
    date,
    location: raw?.location ?? raw?.local ?? null,
    scoreA: Number.isFinite(scoreA) ? scoreA : 0,
    scoreB: Number.isFinite(scoreB) ? scoreB : 0,
    score: {
      teamA: Number.isFinite(scoreA) ? scoreA : 0,
      teamB: Number.isFinite(scoreB) ? scoreB : 0,
    },
    teamA,
    teamB,
    presences,
  };
}

export function useAdminMatches(options: AdminMatchesOptions = {}) {
  const { rachaId } = useRacha();
  const enabled = options.enabled ?? true;
  const key = enabled && rachaId ? `/api/partidas?rachaId=${rachaId}` : null;

  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
  });

  const matches = useMemo(() => {
    if (!enabled) return [];
    if (!Array.isArray(data)) return [];
    return data.map((item) => normalizeMatch(item));
  }, [data, enabled]);

  return {
    matches,
    isLoading: enabled ? isLoading : false,
    isError: Boolean(error),
    error,
    mutate,
  };
}
