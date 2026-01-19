"use client";

import useSWR from "swr";
import type { AthleteRequest } from "@/types/athlete-request";

const fetcher = async (url: string): Promise<AthleteRequest[]> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    let message = text || "Erro ao carregar solicitacoes.";
    try {
      const body = JSON.parse(text);
      message = body?.message || body?.error || message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
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
      "Erro ao processar solicitacao";
    throw new Error(typeof message === "string" ? message : "Erro ao processar solicitacao");
  }

  return body;
}

export function useAthleteRequests(options?: { status?: string; enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const params = new URLSearchParams();
  if (options?.status) {
    params.set("status", options.status);
  }
  const url = params.toString() ? `/api/admin/solicitacoes?${params.toString()}` : null;

  const { data, error, isLoading, mutate } = useSWR<AthleteRequest[]>(
    enabled ? url : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const approve = async (id: string) => {
    await requestJson(`/api/admin/solicitacoes/${id}/approve`, {
      method: "PUT",
    });
    await mutate();
  };

  const reject = async (id: string, message?: string) => {
    await requestJson(`/api/admin/solicitacoes/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify({ message }),
    });
    await mutate();
  };

  return {
    solicitacoes: Array.isArray(data) ? data : [],
    isLoading,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    approve,
    reject,
    mutate,
  };
}
