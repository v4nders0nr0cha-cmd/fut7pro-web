"use client";

import useSWR from "swr";

export type AdminAccessResponse = {
  allowed: boolean;
  blocked: boolean;
  status?: string;
  statusRaw?: string | null;
  reason?: string | null;
  trialEnd?: string | null;
  currentPeriodEnd?: string | null;
  planKey?: string | null;
  daysRemaining?: number | null;
  tenant?: {
    id: string;
    slug: string;
    name: string;
  } | null;
  role?: string | null;
};

const fetcher = async (url: string): Promise<AdminAccessResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  let body: any = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const error = new Error(
      typeof body?.message === "string" ? body.message : "Falha ao validar acesso"
    ) as Error & { status?: number; body?: unknown };
    error.status = res.status;
    error.body = body;
    throw error;
  }
  return body as AdminAccessResponse;
};

export function useAdminAccess(enabled = true) {
  const { data, error, isLoading, mutate } = useSWR<AdminAccessResponse>(
    enabled ? "/api/admin/access" : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    access: data ?? null,
    isLoading,
    error,
    mutate,
  };
}
