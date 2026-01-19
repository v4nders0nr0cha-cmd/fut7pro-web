"use client";

import { useState } from "react";
import useSWR from "swr";

type AutoApproveResponse = { autoApproveAthletes: boolean };

const fetcher = async (url: string): Promise<AutoApproveResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    let message = text || "Erro ao carregar configuracao.";
    try {
      const body = JSON.parse(text);
      message = body?.message || body?.error || message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
  return res.json();
};

async function requestJson(input: string, init?: RequestInit) {
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
      "Erro ao atualizar configuracao";
    throw new Error(typeof message === "string" ? message : "Erro ao atualizar configuracao");
  }

  return body;
}

export function useAutoApproveAthletes(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const { data, error, isLoading, mutate } = useSWR<AutoApproveResponse>(
    enabled ? "/api/admin/solicitacoes/auto-approve" : null,
    fetcher,
    { revalidateOnFocus: false }
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleAutoApprove = async (enabledNext: boolean) => {
    setIsUpdating(true);
    try {
      await requestJson("/api/admin/solicitacoes/auto-approve", {
        method: "PUT",
        body: JSON.stringify({ enabled: enabledNext }),
      });
      await mutate();
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    autoApproveAthletes: Boolean(data?.autoApproveAthletes),
    isLoading,
    isUpdating,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    toggleAutoApprove,
    mutate,
  };
}
