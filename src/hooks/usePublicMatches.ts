import useSWR from "swr";
import { rachaConfig } from "@/config/racha.config";
import type { PublicMatch, PublicMatchesResponse } from "@/types/partida";

type Scope = "today" | "recent" | "upcoming";

const fetcher = async (url: string): Promise<PublicMatchesResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || "Falha ao buscar partidas publicas");
  }
  return res.json();
};

function buildKey(slug?: string, scope?: Scope, limit?: number, date?: string) {
  if (!slug) return null;
  const search = new URLSearchParams();
  if (scope) search.set("scope", scope);
  if (limit) search.set("limit", String(limit));
  if (date) search.set("date", date);
  const suffix = search.toString();
  return `/api/public/${slug}/matches${suffix ? `?${suffix}` : ""}`;
}

export function usePublicMatches(
  options: { slug?: string; scope?: Scope; limit?: number; enabled?: boolean } = {}
) {
  const enabled = options.enabled ?? true;
  const slug = options.slug || rachaConfig.slug;
  const key = enabled ? buildKey(slug, options.scope ?? "recent", options.limit ?? 12) : null;

  const { data, error, isLoading, mutate } = useSWR<PublicMatchesResponse>(
    key,
    fetcher,
    enabled
      ? {
          revalidateOnFocus: false,
        }
      : {
          revalidateOnFocus: false,
          revalidateIfStale: false,
          revalidateOnReconnect: false,
        }
  );

  return {
    matches: enabled ? (data?.results ?? []) : [],
    total: enabled ? (data?.total ?? 0) : 0,
    slug: data?.slug ?? slug,
    isLoading: enabled ? isLoading : false,
    isError: Boolean(error),
    error,
    mutate,
  };
}
