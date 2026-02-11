"use client";

import useSWR from "swr";
import type { Time } from "@/types/time";

const DEFAULT_LOGO = "/images/times/time_padrao_01.png";
const DEFAULT_COR = "#FFD700";

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Erro ao buscar times");
  }
  return res.json();
};

function slugify(value: string) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function normalizeTime(raw: any): Time {
  const nome = raw?.nome || raw?.name || raw?.title || "Time";
  const slug = raw?.slug || slugify(nome) || raw?.id || "time";
  const logo = raw?.logo || raw?.logoUrl || DEFAULT_LOGO;
  const cor = raw?.cor || raw?.color || DEFAULT_COR;

  return {
    id: raw?.id || slug,
    nome,
    name: raw?.name,
    slug,
    logo,
    logoUrl: raw?.logoUrl ?? raw?.logo,
    cor,
    color: raw?.color,
    corSecundaria: raw?.corSecundaria || raw?.secondaryColor,
    rachaId: raw?.rachaId || raw?.tenantId || "",
    tenantId: raw?.tenantId,
    tenantSlug: raw?.tenantSlug,
    jogadores: raw?.jogadores || raw?.players,
    criadoEm: raw?.criadoEm || raw?.createdAt,
    atualizadoEm: raw?.atualizadoEm || raw?.updatedAt,
    createdAt: raw?.createdAt,
    updatedAt: raw?.updatedAt,
  };
}

export function useTimes(tenantSlug?: string) {
  const slug = tenantSlug?.trim();
  const search = slug ? `?slug=${encodeURIComponent(slug)}` : "";
  const key = slug ? `/api/times${search}` : null;

  const { data, error, mutate, isLoading } = useSWR<Time[]>(
    key,
    async (url: string) => {
      const payload = await fetcher(url);
      const list = Array.isArray(payload?.results) ? payload.results : payload;
      return Array.isArray(list) ? list.map(normalizeTime) : [];
    },
    { revalidateOnFocus: false }
  );

  async function addTime(time: Partial<Time>) {
    if (!slug) {
      throw new Error("Selecione o racha ativo antes de criar um time.");
    }
    const payload = {
      name: time.nome || time.name || "Novo Time",
      color: time.cor || time.color || DEFAULT_COR,
      logoUrl: time.logo || time.logoUrl || DEFAULT_LOGO,
    };

    const res = await fetch(`/api/times${search}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Falha ao criar time");
    }

    await mutate();
  }

  async function updateTime(time: Time) {
    if (!slug) {
      throw new Error("Selecione o racha ativo antes de atualizar um time.");
    }
    const payload = {
      name: time.nome || time.name || "Time",
      color: time.cor || time.color || DEFAULT_COR,
      logoUrl: time.logo || time.logoUrl || DEFAULT_LOGO,
    };

    const res = await fetch(`/api/times/${time.id}${search}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Falha ao atualizar time");
    }

    await mutate();
  }

  async function deleteTime(id: string) {
    if (!slug) {
      throw new Error("Selecione o racha ativo antes de remover um time.");
    }
    const res = await fetch(`/api/times/${id}${search}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Falha ao remover time");
    }

    await mutate();
  }

  return {
    times: data || [],
    isLoading: isLoading || (!data && !error),
    isError: !!error,
    addTime,
    updateTime,
    deleteTime,
    mutate,
  };
}
