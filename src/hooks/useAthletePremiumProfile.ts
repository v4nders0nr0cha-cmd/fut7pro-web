"use client";

import useSWR from "swr";
import type { AthletePremiumProfilePayload } from "@/types/athlete-premium-profile";

const fetcher = async (url: string): Promise<AthletePremiumProfilePayload> => {
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!res.ok) {
    const message =
      (body as { message?: string; error?: string } | null)?.message ||
      (body as { message?: string; error?: string } | null)?.error ||
      (typeof body === "string" ? body : "") ||
      "Falha ao carregar perfil premium";
    throw new Error(message);
  }

  return body as AthletePremiumProfilePayload;
};

export function usePublicAthletePremiumProfile(options: {
  tenantSlug?: string | null;
  athleteSlug?: string | null;
  year?: number;
  statsPeriod?: "current" | "all";
  enabled?: boolean;
}) {
  const enabled = options.enabled ?? true;
  const tenantSlug = options.tenantSlug?.trim();
  const athleteSlug = options.athleteSlug?.trim();
  const params = new URLSearchParams();
  if (options.year) params.set("year", String(options.year));
  if (options.statsPeriod) params.set("statsPeriod", options.statsPeriod);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const key =
    enabled && tenantSlug && athleteSlug
      ? `/api/public/${encodeURIComponent(tenantSlug)}/athletes/${encodeURIComponent(
          athleteSlug
        )}/premium-profile${suffix}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<AthletePremiumProfilePayload>(key, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    premiumProfile: data ?? null,
    isLoading,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}

export function useOwnerAthletePremiumProfile(options: {
  tenantSlug?: string | null;
  year?: number;
  statsPeriod?: "current" | "all";
  enabled?: boolean;
}) {
  const enabled = options.enabled ?? true;
  const tenantSlug = options.tenantSlug?.trim();
  const params = new URLSearchParams();
  if (options.year) params.set("year", String(options.year));
  if (options.statsPeriod) params.set("statsPeriod", options.statsPeriod);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const key =
    enabled && tenantSlug
      ? `/api/tenants/${encodeURIComponent(tenantSlug)}/me/premium-profile${suffix}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<AthletePremiumProfilePayload>(key, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    premiumProfile: data ?? null,
    isLoading,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}

export async function markLegendaryCelebrationSeen(options: { tenantSlug: string; year?: number }) {
  const params = new URLSearchParams();
  if (options.year) params.set("year", String(options.year));
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(
    `/api/tenants/${encodeURIComponent(
      options.tenantSlug
    )}/me/premium-profile/legendary-celebration/seen${suffix}`,
    { method: "POST", cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Falha ao marcar celebração lendária como vista.");
  }

  return res.json() as Promise<{ ok: boolean; seasonYear: number }>;
}
