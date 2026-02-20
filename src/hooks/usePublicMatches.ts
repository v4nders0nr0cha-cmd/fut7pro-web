import useSWR from "swr";
import type { PublicMatchesResponse } from "@/types/partida";

type Scope = "today" | "recent" | "upcoming";

type PublicMatchesOptions = {
  slug?: string;
  scope?: Scope;
  limit?: number;
  date?: string;
  from?: string;
  to?: string;
  enabled?: boolean;
};

const fetcher = async (url: string): Promise<PublicMatchesResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || "Falha ao buscar partidas publicas");
  }
  return res.json();
};

function buildKey(
  slug?: string,
  scope?: Scope,
  limit?: number,
  date?: string,
  from?: string,
  to?: string
) {
  if (!slug) return null;
  const search = new URLSearchParams();
  if (scope) search.set("scope", scope);
  if (limit) search.set("limit", String(limit));
  if (date) search.set("date", date);
  if (from) search.set("from", from);
  if (to) search.set("to", to);
  const suffix = search.toString();
  return `/api/public/${slug}/matches${suffix ? `?${suffix}` : ""}`;
}

export function usePublicMatches(options: PublicMatchesOptions = {}) {
  const enabled = options.enabled ?? true;
  const slug = options.slug?.trim() || "";
  const hasRange = Boolean(options.date || options.from || options.to);
  const scope = options.scope ?? (hasRange ? undefined : "recent");
  const limit = options.limit ?? (hasRange ? undefined : 12);
  const key = enabled ? buildKey(slug, scope, limit, options.date, options.from, options.to) : null;

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
