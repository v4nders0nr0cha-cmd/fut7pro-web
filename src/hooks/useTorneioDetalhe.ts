import { useMemo } from "react";
import useSWR from "swr";
import { useAuth } from "./useAuth";
import { useRacha } from "@/context/RachaContext";
import type { Torneio } from "@/types/torneio";
import { normalizeTorneio } from "./useTorneios";

const fetcher = async (url: string): Promise<Torneio> => {
  const res = await fetch(url, { cache: "no-store" });
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const errorMessage =
      payload && typeof payload === "object" && "error" in payload ? (payload as any).error : null;
    throw new Error(errorMessage ?? "Falha ao carregar torneio");
  }
  return normalizeTorneio(payload);
};

export function useTorneioDetalhe(
  torneioId?: string | null,
  tenantSlug?: string | null,
  fallback?: Torneio | null
) {
  const { user } = useAuth();
  const { rachaId } = useRacha();

  const resolvedSlug = useMemo(() => {
    return tenantSlug ?? user?.tenantSlug ?? (rachaId || null);
  }, [tenantSlug, user?.tenantSlug, rachaId]);

  const fallbackData = useMemo(() => {
    return fallback ? normalizeTorneio(fallback) : undefined;
  }, [fallback]);

  const key = torneioId
    ? `/api/admin/torneios/${encodeURIComponent(torneioId)}${
        resolvedSlug ? `?slug=${encodeURIComponent(resolvedSlug)}` : ""
      }`
    : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<Torneio>(key, fetcher, {
    revalidateOnFocus: false,
    fallbackData,
  });

  return {
    torneio: data ?? fallbackData ?? null,
    isLoading: isLoading ?? false,
    isValidating: isValidating ?? false,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}
