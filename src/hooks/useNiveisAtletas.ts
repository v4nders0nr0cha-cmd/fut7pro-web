"use client";

import useSWR from "swr";
import { useRacha } from "@/context/RachaContext";
import { useApiState } from "./useApiState";
import type { AvaliacaoEstrela } from "@/types/sorteio";

export type AtualizarNivelPayload = {
  athleteId?: string;
  jogadorId?: string;
  habilidade: number;
  fisico: number;
};

type ApiRequestError = Error & {
  status?: number;
  retryAfterMs?: number;
};

export type AtualizarNivelResult =
  | { ok: true; data: AvaliacaoEstrela }
  | {
      ok: false;
      error: {
        message: string;
        status?: number;
        isRateLimit: boolean;
      };
    };

const fetcher = async (url: string): Promise<AvaliacaoEstrela[]> => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || "Erro ao buscar niveis dos atletas");
  }
  return response.json();
};

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const parseRetryAfterMs = (headerValue: string | null): number | null => {
  if (!headerValue) return null;
  const seconds = Number(headerValue);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.round(seconds * 1000);
  }
  const retryDate = new Date(headerValue).getTime();
  if (Number.isFinite(retryDate)) {
    return Math.max(0, retryDate - Date.now());
  }
  return null;
};

const toApiRequestError = (error: unknown): ApiRequestError => {
  if (error instanceof Error) {
    return error as ApiRequestError;
  }
  const fallback = new Error("Erro ao processar requisicao") as ApiRequestError;
  return fallback;
};

const getNivelKey = (nivel: Partial<AvaliacaoEstrela>) => nivel.jogadorId || nivel.athleteId || "";

export function useNiveisAtletas(rachaIdParam?: string, options?: { enabled?: boolean }) {
  const { rachaId: rachaIdContext } = useRacha();
  const apiState = useApiState();
  const rachaId = rachaIdParam || rachaIdContext;
  const enabled = options?.enabled ?? true;

  const { data, error, isLoading, mutate } = useSWR<AvaliacaoEstrela[]>(
    rachaId && enabled ? "/api/estrelas" : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const requestJsonWithRetry = async (
    input: string,
    init: RequestInit,
    maxRetries = 2
  ): Promise<AvaliacaoEstrela> => {
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      const response = await fetch(input, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init.headers || {}),
        },
      });

      const text = await response.text();
      let body: unknown = undefined;
      if (text) {
        try {
          body = JSON.parse(text);
        } catch {
          body = text;
        }
      }

      if (response.ok) {
        return body as AvaliacaoEstrela;
      }

      const message =
        (body as { message?: string; error?: string } | undefined)?.message ||
        (body as { error?: string } | undefined)?.error ||
        response.statusText ||
        "Erro ao processar requisicao";

      const error = new Error(
        typeof message === "string" ? message : "Erro ao processar requisicao"
      ) as ApiRequestError;
      error.status = response.status;
      error.retryAfterMs = parseRetryAfterMs(response.headers.get("retry-after"));

      const canRetry = RETRYABLE_STATUS.has(response.status) && attempt < maxRetries;
      if (!canRetry) {
        throw error;
      }

      const exponentialBackoffMs = 250 * 2 ** attempt;
      const retryDelayMs =
        response.status === 429
          ? Math.max(exponentialBackoffMs, error.retryAfterMs ?? 0)
          : exponentialBackoffMs;
      await delay(retryDelayMs);
    }

    const exhausted = new Error("Falha ao processar requisicao") as ApiRequestError;
    throw exhausted;
  };

  const atualizarNivel = async (payload: AtualizarNivelPayload): Promise<AtualizarNivelResult> => {
    apiState.setLoading(true);
    try {
      const response = await requestJsonWithRetry("/api/estrelas", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      await mutate(
        (current) => {
          const existing = Array.isArray(current) ? [...current] : [];
          const responseKey = getNivelKey(response);
          if (!responseKey) return existing;
          const levelIndex = existing.findIndex((item) => getNivelKey(item) === responseKey);
          if (levelIndex >= 0) {
            existing[levelIndex] = response;
          } else {
            existing.unshift(response);
          }
          return existing;
        },
        { revalidate: false }
      );
      apiState.setSuccess(true);
      return { ok: true, data: response };
    } catch (cause) {
      const error = toApiRequestError(cause);
      const message = error.message || "Erro ao processar requisicao";
      apiState.setError(message);
      return {
        ok: false,
        error: {
          message,
          status: error.status,
          isRateLimit: error.status === 429,
        },
      };
    }
  };

  const getNivelByJogador = (id: string) => {
    return (data || []).find((nivel) => nivel.jogadorId === id || nivel.athleteId === id) || null;
  };

  const revalidarNiveis = async () => {
    await mutate();
  };

  return {
    niveis: data || [],
    isLoading: isLoading || apiState.isLoading,
    isError: Boolean(error) || apiState.isError,
    error: apiState.error || (error instanceof Error ? error.message : null),
    isSuccess: apiState.isSuccess,
    atualizarNivel,
    getNivelByJogador,
    mutate,
    revalidarNiveis,
    reset: apiState.reset,
  };
}
