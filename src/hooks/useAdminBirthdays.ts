"use client";

import useSWR from "swr";
import type { BirthdayEntry } from "@/types/birthdays";
import { useRacha } from "@/context/RachaContext";

type AdminBirthdaysOptions = {
  month?: number;
  rangeDays?: number;
  limit?: number;
  enabled?: boolean;
  tenantId?: string;
};

const fetcher = async ([url]: [string, string]): Promise<BirthdayEntry[]> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || "Falha ao buscar aniversariantes");
  }
  return res.json();
};

function buildKey(options: AdminBirthdaysOptions) {
  const search = new URLSearchParams();
  if (options.month) search.set("month", String(options.month));
  if (options.rangeDays) search.set("range", String(options.rangeDays));
  if (options.limit) search.set("limit", String(options.limit));
  const suffix = search.toString();
  return `/api/jogadores/aniversariantes${suffix ? `?${suffix}` : ""}`;
}

export function useAdminBirthdays(options: AdminBirthdaysOptions = {}) {
  const enabled = options.enabled ?? true;
  const { rachaId } = useRacha();
  const key = enabled
    ? ([buildKey(options), options.tenantId ?? rachaId ?? "active"] as [string, string])
    : null;
  const { data, error, isLoading, mutate } = useSWR<BirthdayEntry[]>(key, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    birthdays: data ?? [],
    isLoading: enabled ? isLoading : false,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}
