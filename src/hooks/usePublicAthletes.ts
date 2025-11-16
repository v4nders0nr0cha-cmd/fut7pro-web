"use client";

import { useMemo } from "react";
import useSWR from "swr";
import type { Atleta } from "@/types/atletas";
import { usePublicTenantSlug } from "./usePublicTenantSlug";
import { normalizeAtleta } from "@/utils/normalize-atleta";

type PublicAthletesResponse = {
  slug?: string;
  total?: number;
  results?: unknown[];
  error?: string;
};

async function fetchPublicAthletes(url: string) {
  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const message =
      (payload && typeof payload === "object" && "error" in payload && payload.error) ||
      `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(String(message));
  }

  const payload: PublicAthletesResponse | unknown[] = await res.json();

  const rawResults = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.results)
      ? payload.results
      : [];

  const athletes: Atleta[] = rawResults
    .map((item) => normalizeAtleta(item))
    .filter((item): item is Atleta => Boolean(item));

  const total =
    (Array.isArray(payload)
      ? payload.length
      : typeof payload?.total === "number"
        ? payload.total
        : null) ?? athletes.length;

  return {
    athletes,
    total,
    raw: payload,
  };
}

type UsePublicAthletesOptions = {
  tenantSlug?: string;
  search?: string;
  status?: string;
  position?: string;
  limit?: number;
  page?: number;
  pageSize?: number;
};

export function usePublicAthletes(options?: UsePublicAthletesOptions) {
  const resolvedSlug = usePublicTenantSlug();
  const tenantSlug = options?.tenantSlug ?? resolvedSlug;

  const query = useMemo(() => {
    if (!tenantSlug) return null;
    const params = new URLSearchParams();
    params.set("slug", tenantSlug);
    if (options?.search) params.set("search", options.search);
    if (options?.status) params.set("status", options.status);
    if (options?.position) params.set("position", options.position);
    if (typeof options?.limit === "number") params.set("limit", String(options.limit));
    if (typeof options?.page === "number") params.set("page", String(options.page));
    if (typeof options?.pageSize === "number") params.set("pageSize", String(options.pageSize));
    return `/api/public/athletes?${params.toString()}`;
  }, [
    tenantSlug,
    options?.search,
    options?.status,
    options?.position,
    options?.limit,
    options?.page,
    options?.pageSize,
  ]);

  const { data, error, isLoading, isValidating, mutate } = useSWR(query, fetchPublicAthletes, {
    revalidateOnFocus: false,
    keepPreviousData: true,
    shouldRetryOnError: true,
  });

  return {
    athletes: data?.athletes ?? [],
    total: data?.total ?? 0,
    isLoading: isLoading ?? false,
    isValidating: isValidating ?? false,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}
