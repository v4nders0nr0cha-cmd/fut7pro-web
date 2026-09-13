"use client";

import useSWR from "swr";
import type { GlobalProfileResponse } from "@/types/global-profile";

const PROFILE_TIMEOUT_MS = 12000;
const NO_AUTO_RETRY_STATUSES = new Set([401, 403, 429]);

function parseErrorMessage(status: number, body: unknown) {
  const message =
    (body as { message?: string; error?: string } | null)?.message ||
    (body as { message?: string; error?: string } | null)?.error ||
    (typeof body === "string" ? body : "");

  if (status === 401) {
    return "Sua sessão expirou. Entre novamente para acessar sua Conta Fut7Pro.";
  }
  if (status === 403) {
    return "Você não tem permissão para acessar estes dados.";
  }
  if (status === 429) {
    return "Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.";
  }
  return message || "Falha ao carregar perfil global";
}

const fetcher = async (url: string): Promise<GlobalProfileResponse> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), PROFILE_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store", signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Tempo esgotado ao carregar perfil global.");
    }
    throw err;
  } finally {
    window.clearTimeout(timeout);
  }
  if (!res.ok) {
    const text = await res.text();
    let body: unknown = text;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    const err = new Error(parseErrorMessage(res.status, body)) as Error & {
      status?: number;
      retryAfter?: string | null;
    };
    err.status = res.status;
    err.retryAfter = res.headers.get("retry-after");
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
  birthPublic?: boolean;
};

export function useGlobalProfile(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const { data, error, isLoading, mutate } = useSWR<GlobalProfileResponse>(
    enabled ? "/api/perfil/global" : null,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: (err) => {
        const status = (err as { status?: number } | undefined)?.status;
        return !status || !NO_AUTO_RETRY_STATUSES.has(status);
      },
      errorRetryCount: 1,
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
