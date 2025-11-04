"use client";

import useSWR from "swr";
import { adminMatchesApi } from "@/lib/api";
import { useApiState } from "./useApiState";
import type { Match } from "@/types/partida";

type UseAdminMatchesOptions = {
  slug: string | null | undefined;
  params?: Record<string, string | number | boolean>;
};

export function useAdminMatches({ slug, params }: UseAdminMatchesOptions) {
  const apiState = useApiState();
  type MatchesKey = readonly ["admin/matches", string, string];

  const key: MatchesKey | null =
    slug && slug.length > 0
      ? ["admin/matches", slug, JSON.stringify(params ?? {})]
      : null;

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<Match[], Error, MatchesKey>(key, async (keyTuple) => {
    const [, currentSlug, currentParamsJson] = keyTuple;
    const parsedParams = currentParamsJson
      ? (JSON.parse(currentParamsJson) as Record<string, string | number | boolean>)
      : {};
    const query: Record<string, string | number | boolean> = { slug: currentSlug, ...parsedParams };
    const response = await adminMatchesApi.list(query);
    return response.map(normalizeMatch);
  });

  const refetch = async () => {
    await mutate();
  };

  return {
    matches: data ?? [],
    isLoading: (isLoading ?? false) || apiState.isLoading,
    isError: Boolean(error) || apiState.isError,
    error: error instanceof Error ? error.message : apiState.error,
    isValidating: isValidating ?? false,
    mutate,
    refetch,
  };
}

export function useAdminMatch(slug: string | null | undefined, matchId: string | null | undefined) {
  type MatchKey = readonly ["admin/match", string, string];
  const key: MatchKey | null =
    slug && slug.length > 0 && matchId && matchId.length > 0
      ? ["admin/match", slug, matchId]
      : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<Match | null, Error, MatchKey>(
    key,
    async (keyTuple) => {
      const [, currentSlug, matchId] = keyTuple;
      const response = await adminMatchesApi.getById(matchId, { slug: currentSlug });
      return normalizeMatch(response);
    }
  );

  return {
    match: data ?? null,
    isLoading,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    isValidating,
    mutate,
  };
}

function normalizeMatch(match: Match): Match {
  return {
    ...match,
    date: typeof match.date === "string" ? match.date : new Date(match.date).toISOString(),
    presences: Array.isArray(match.presences)
      ? match.presences.map((presence) => ({
          ...presence,
          updatedAt:
            typeof (presence as any).updatedAt === "string"
              ? (presence as any).updatedAt
              : new Date((presence as any).updatedAt).toISOString(),
        }))
      : [],
  };
}
