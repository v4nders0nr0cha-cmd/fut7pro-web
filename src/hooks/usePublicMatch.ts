import useSWR from "swr";
import type { PublicMatch } from "@/types/partida";

type PublicMatchResponse = {
  slug?: string;
  result?: PublicMatch;
};

const fetcher = async (url: string): Promise<PublicMatch> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || "Falha ao buscar partida publica");
  }
  const data = (await res.json()) as PublicMatch | PublicMatchResponse;
  if (data && typeof data === "object" && "result" in data) {
    return (data as PublicMatchResponse).result ?? (data as PublicMatch);
  }
  return data as PublicMatch;
};

export function usePublicMatch(id?: string, slug?: string) {
  const resolvedSlug = slug?.trim() || "";
  const key = id && resolvedSlug ? `/api/public/${resolvedSlug}/matches/${id}` : null;

  const { data, error, isLoading, mutate } = useSWR<PublicMatch>(key, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    match: data ?? null,
    isLoading,
    isError: Boolean(error),
    error,
    mutate,
  };
}
