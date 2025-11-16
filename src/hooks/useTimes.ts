"use client";

import useSWR from "swr";
import type { Time } from "@/types/time";

async function fetchTimes(url: string): Promise<Time[]> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const message = await response.text().catch(() => "Erro ao carregar times");
    throw new Error(message || "Erro ao carregar times");
  }
  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
}

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T | null> {
  const response = await fetch(input, init);
  if (!response.ok) {
    const message = await response.text().catch(() => "Falha na requisicao de times");
    throw new Error(message || "Falha na requisicao de times");
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export function useTimes(tenantSlug: string | null | undefined) {
  const endpoint = tenantSlug ? `/api/admin/rachas/${tenantSlug}/times` : null;

  const { data, error, isLoading, mutate } = useSWR<Time[]>(endpoint, fetchTimes, {
    revalidateOnFocus: true,
    keepPreviousData: true,
  });

  async function addTime(payload: Partial<Time>) {
    if (!tenantSlug || !endpoint) return null;
    const body = {
      nome: payload.nome ?? "Novo Time",
      slug: payload.slug ?? payload.nome?.toLowerCase().replace(/\s+/g, "-") ?? "novo-time",
      logo: payload.logo ?? "/images/times/time_padrao_01.png",
      cor: payload.cor ?? "#FFD700",
      corSecundaria: payload.corSecundaria ?? "#FFFFFF",
    };
    const result = await request<Time>(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await mutate();
    return result;
  }

  async function updateTime(time: Time) {
    if (!tenantSlug) return null;
    const result = await request<Time>(`/api/admin/rachas/${tenantSlug}/times/${time.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(time),
    });
    await mutate();
    return result;
  }

  async function deleteTime(id: string) {
    if (!tenantSlug) return null;
    await request<void>(`/api/admin/rachas/${tenantSlug}/times/${id}`, {
      method: "DELETE",
    });
    await mutate();
    return null;
  }

  return {
    times: data ?? [],
    isLoading: Boolean(isLoading),
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    addTime,
    updateTime,
    deleteTime,
    mutate,
  };
}
