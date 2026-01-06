import useSWR from "swr";
import { rachaConfig } from "@/config/racha.config";
import type { PublicDestaquesDoDiaResponse } from "@/types/destaques";

type Options = {
  slug?: string;
  date?: string;
  enabled?: boolean;
};

const fetcher = async (url: string): Promise<PublicDestaquesDoDiaResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || "Falha ao buscar destaques do dia");
  }
  return res.json();
};

function buildKey(slug?: string, date?: string) {
  if (!slug) return null;
  const search = new URLSearchParams();
  if (date) search.set("date", date);
  const suffix = search.toString();
  return `/api/public/${slug}/destaques-do-dia${suffix ? `?${suffix}` : ""}`;
}

export function usePublicDestaquesDoDia(options: Options = {}) {
  const enabled = options.enabled ?? true;
  const slug = options.slug || rachaConfig.slug;
  const key = enabled ? buildKey(slug, options.date) : null;

  const { data, error, isLoading, mutate } = useSWR<PublicDestaquesDoDiaResponse>(
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
    destaque: enabled ? (data?.destaque ?? null) : null,
    slug: data?.slug ?? slug,
    isLoading: enabled ? isLoading : false,
    isError: Boolean(error),
    error,
    mutate,
  };
}
