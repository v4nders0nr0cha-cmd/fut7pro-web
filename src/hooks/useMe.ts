"use client";

import useSWR from "swr";
import type { MeResponse } from "@/types/me";

const ME_TIMEOUT_MS = 12000;

const fetcher = async (url: string): Promise<MeResponse> => {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), ME_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });
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
        "Falha ao carregar perfil";
      throw new Error(message);
    }

    return (body as MeResponse) ?? ({} as MeResponse);
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") {
      throw new Error("Tempo limite ao carregar perfil.");
    }
    throw cause;
  } finally {
    globalThis.clearTimeout(timeout);
  }
};

export function useMe(options?: {
  enabled?: boolean;
  tenantSlug?: string | null;
  context?: "athlete" | "admin";
}) {
  const enabled = options?.enabled ?? true;
  const params = new URLSearchParams();
  if (options?.tenantSlug) {
    const slug = options.tenantSlug.trim().toLowerCase();
    if (slug) {
      params.set("slug", slug);
    }
  }
  if (options?.context === "athlete" || options?.context === "admin") {
    params.set("context", options.context);
  }
  const url = params.toString() ? `/api/me?${params.toString()}` : "/api/me";
  const { data, error, isLoading, mutate } = useSWR<MeResponse>(enabled ? url : null, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    me: data ?? null,
    isLoading,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}
