"use client";

import useSWR from "swr";
import type { Time } from "@/types/time";
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTimes(tenantSlug: string | null | undefined) {
  const effectiveSlug = tenantSlug ?? "default";
  const storageKey = `fut7pro_times_${effectiveSlug}`;

  const { data, error, isLoading, mutate } = useSWR<Time[]>(
    tenantSlug ? `/api/admin/rachas/${tenantSlug}/times` : null,
    fetcher,
    {
      fallbackData:
        typeof window !== "undefined" ? JSON.parse(localStorage.getItem(storageKey) || "[]") : [],
    }
  );

  if (typeof window !== "undefined" && Array.isArray(data)) {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  async function addTime(time: Partial<Time>) {
    if (!tenantSlug) return;

    const novoTime: Time = {
      id: crypto.randomUUID(),
      nome: time.nome || "Novo Time",
      slug: (time.slug || time.nome || "novo-time").toLowerCase().replace(/\s+/g, "-"),
      logo: time.logo || "/images/times/time_padrao_01.png",
      cor: time.cor || "#FFD700",
      corSecundaria: time.corSecundaria || "#FFFFFF",
      rachaId: tenantSlug,
    };

    try {
      await fetch(`/api/admin/rachas/${tenantSlug}/times`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoTime),
      });
    } catch {
      const localTimes: Time[] = JSON.parse(localStorage.getItem(storageKey) || "[]");
      localStorage.setItem(storageKey, JSON.stringify([...localTimes, novoTime]));
    }
    mutate();
  }

  async function updateTime(time: Time) {
    if (!tenantSlug) return;

    try {
      await fetch(`/api/admin/rachas/${tenantSlug}/times/${time.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(time),
      });
    } catch {
      const localTimes: Time[] = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const atualizados = localTimes.map((t) => (t.id === time.id ? time : t));
      localStorage.setItem(storageKey, JSON.stringify(atualizados));
    }
    mutate();
  }

  async function deleteTime(id: string) {
    if (!tenantSlug) return;

    try {
      await fetch(`/api/admin/rachas/${tenantSlug}/times/${id}`, {
        method: "DELETE",
      });
    } catch {
      const localTimes: Time[] = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const atualizados = localTimes.filter((t) => t.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(atualizados));
    }
    mutate();
  }

  return {
    times: Array.isArray(data) ? data : [],
    isLoading: Boolean(isLoading),
    isError: Boolean(error),
    error,
    addTime,
    updateTime,
    deleteTime,
    mutate,
  };
}
