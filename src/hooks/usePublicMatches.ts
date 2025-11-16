"use client";

import useSWR from "swr";
import { publicMatchesApi } from "@/lib/api";
import type { Match } from "@/types/partida";

type UsePublicMatchesOptions = {
  slug: string | null | undefined;
  params?: Record<string, string | number | boolean>;
};

type PublicMatchesKey = readonly [
  "public/matches",
  string,
  Record<string, string | number | boolean> | null,
];

type PublicMatchKey = readonly ["public/match", string, string];

export function usePublicMatches({ slug, params }: UsePublicMatchesOptions) {
  const key: PublicMatchesKey | null =
    slug && slug.length > 0 ? ["public/matches", slug, params ?? null] : null;

  const { data, error, isLoading, mutate, isValidating } = useSWR<
    Match[],
    Error,
    PublicMatchesKey | null
  >(
    key,
    async ([, currentSlug, currentParams]) => {
      const response = await publicMatchesApi.list(currentSlug, currentParams ?? undefined);
      return response.results ?? [];
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    matches: data ?? [],
    isLoading,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    isValidating,
    mutate,
  };
}

type UsePublicMatchOptions = {
  slug: string | null | undefined;
  matchId: string | null | undefined;
};

export function usePublicMatch({ slug, matchId }: UsePublicMatchOptions) {
  const key: PublicMatchKey | null =
    slug && slug.length > 0 && matchId && matchId.length > 0
      ? ["public/match", slug, matchId]
      : null;

  const { data, error, isLoading, mutate, isValidating } = useSWR<
    Match | null,
    Error,
    PublicMatchKey | null
  >(
    key,
    async ([, currentSlug, id]) => {
      const response = await publicMatchesApi.getById(currentSlug, id);
      return response.result ?? null;
    },
    {
      revalidateOnFocus: false,
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
