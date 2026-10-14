"use client";

import useSWR from "swr";
import type { OwnershipTransferCandidate, OwnershipTransferRequest } from "@/types/admin-roles";

type CandidatesResponse = { results: OwnershipTransferCandidate[] };
type TransfersResponse = { results: OwnershipTransferRequest[] };

async function readResponse<T>(response: Response, fallback: string): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.message || body?.error || fallback);
  }
  return body as T;
}

export function useOwnershipTransferCandidates(query: string, enabled = true) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const key = enabled
    ? `/api/admin/administradores/transferir-propriedade/candidatos${suffix}`
    : null;
  const { data, error, isLoading } = useSWR<CandidatesResponse>(key, async (url: string) => {
    const response = await fetch(url, { cache: "no-store" });
    return readResponse<CandidatesResponse>(response, "Erro ao carregar candidatos.");
  });

  return {
    candidates: data?.results ?? [],
    isLoading,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
  };
}

export function useOwnershipTransfers() {
  const key = "/api/admin/administradores/transferir-propriedade";
  const { data, error, isLoading, mutate } = useSWR<TransfersResponse>(key, async (url: string) => {
    const response = await fetch(url, { cache: "no-store" });
    return readResponse<TransfersResponse>(response, "Erro ao consultar a transferência.");
  });

  const requestTransfer = async (input: { athleteId: string; password: string; email: string }) => {
    try {
      const response = await fetch(key, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      return await readResponse<{ ok: true; request: OwnershipTransferRequest }>(
        response,
        "Erro ao solicitar a transferência."
      );
    } finally {
      await mutate().catch(() => undefined);
    }
  };

  const cancelTransfer = async (requestId: string) => {
    try {
      const response = await fetch(`${key}/${encodeURIComponent(requestId)}`, {
        method: "DELETE",
      });
      return await readResponse<OwnershipTransferRequest>(
        response,
        "Erro ao cancelar a transferência."
      );
    } finally {
      await mutate().catch(() => undefined);
    }
  };

  return {
    transfers: data?.results ?? [],
    pendingTransfer: data?.results.find((item) => item.status === "PENDING") ?? null,
    isLoading,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    requestTransfer,
    cancelTransfer,
    mutate,
  };
}
