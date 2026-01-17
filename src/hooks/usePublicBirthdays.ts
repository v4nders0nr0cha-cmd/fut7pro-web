"use client";

import useSWR from "swr";
import { rachaConfig } from "@/config/racha.config";
import type { BirthdaysResponse } from "@/types/birthdays";

type PublicBirthdaysOptions = {
  slug?: string;
  month?: number;
  limit?: number;
  enabled?: boolean;
};

const fetcher = async (url: string): Promise<BirthdaysResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || "Falha ao buscar aniversariantes");
  }
  return res.json();
};

function buildKey(slug: string, month?: number, limit?: number) {
  const search = new URLSearchParams();
  if (month) search.set("month", String(month));
  if (limit) search.set("limit", String(limit));
  const suffix = search.toString();
  return `/api/public/${slug}/birthdays${suffix ? `?${suffix}` : ""}`;
}

export function usePublicBirthdays(options: PublicBirthdaysOptions = {}) {
  const enabled = options.enabled ?? true;
  const slug = options.slug || rachaConfig.slug;
  const month = options.month ?? new Date().getMonth() + 1;
  const key = enabled ? buildKey(slug, month, options.limit) : null;

  const { data, error, isLoading, mutate } = useSWR<BirthdaysResponse>(key, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    birthdays: data?.results ?? [],
    total: data?.total ?? 0,
    slug: data?.slug ?? slug,
    isLoading: enabled ? isLoading : false,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}
