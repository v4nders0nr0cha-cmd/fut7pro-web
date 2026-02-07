"use client";

import useSWR from "swr";
import type { GlobalProfileResponse } from "@/types/global-profile";

const fetcher = async (url: string): Promise<GlobalProfileResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(body || "Falha ao carregar perfil global") as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.json();
};

type UpdateGlobalProfilePayload = {
  firstName?: string;
  nickname?: string | null;
  avatarUrl?: string | null;
  position?: string;
  positionSecondary?: string | null;
  birthDay?: number | null;
  birthMonth?: number | null;
  birthYear?: number | null;
};

export function useGlobalProfile(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const { data, error, isLoading, mutate } = useSWR<GlobalProfileResponse>(
    enabled ? "/api/perfil/global" : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const updateProfile = async (payload: UpdateGlobalProfilePayload) => {
    const res = await fetch("/api/perfil/global", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(body?.message || body?.error || "Erro ao salvar perfil global.");
    }
    await mutate();
    return body as GlobalProfileResponse;
  };

  return {
    profile: data ?? null,
    isLoading,
    isError: Boolean(error),
    errorStatus: (error as (Error & { status?: number }) | undefined)?.status ?? null,
    error: error instanceof Error ? error.message : null,
    mutate,
    updateProfile,
  };
}
