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

const fetcher = async (url: string): Promise<AvaliacaoEstrela[]> => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || "Erro ao buscar niveis dos atletas");
  }
  return response.json();
};

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

  const requestJson = async (input: string, init?: RequestInit) => {
    const response = await fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
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

    if (!response.ok) {
      const message =
        (body as { message?: string; error?: string } | undefined)?.message ||
        (body as { error?: string } | undefined)?.error ||
        response.statusText ||
        "Erro ao processar requisicao";
      throw new Error(typeof message === "string" ? message : "Erro ao processar requisicao");
    }

    return body as AvaliacaoEstrela;
  };

  const atualizarNivel = async (payload: AtualizarNivelPayload) => {
    return apiState.handleAsync(async () => {
      const response = await requestJson("/api/estrelas", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      await mutate();
      return response;
    });
  };

  const getNivelByJogador = (id: string) => {
    return (data || []).find((nivel) => nivel.jogadorId === id || nivel.athleteId === id) || null;
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
    reset: apiState.reset,
  };
}
