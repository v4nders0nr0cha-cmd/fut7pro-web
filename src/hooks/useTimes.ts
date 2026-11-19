"use client";

import { notifyAdminGuideChanged } from "@/lib/admin-guide-events";
import useSWR from "swr";
import type { Time } from "@/types/time";

const DEFAULT_COR = "#FFD700";

type TeamStatusFilter = "active" | "archived" | "all";

type UseTimesOptions = {
  status?: TeamStatusFilter;
};

type ApiErrorPayload = {
  error?: string;
  message?: string;
  code?: string;
};

export class TimesApiError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "TimesApiError";
    this.code = code;
  }
}

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

export function normalizeTime(raw: any): Time {
  const nome = raw?.nome || raw?.name || raw?.title || "Time";
  const slug = raw?.slug || slugify(nome) || raw?.id || "time";
  const logo = raw?.logoUrl !== undefined ? raw.logoUrl : (raw?.logo ?? null);
  const cor = raw?.cor || raw?.color || DEFAULT_COR;

  return {
    id: raw?.id || slug,
    nome,
    name: raw?.name,
    slug,
    logo,
    logoUrl: logo,
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
    archivedAt: raw?.archivedAt ?? null,
    matchCount: Number.isFinite(Number(raw?.matchCount)) ? Number(raw.matchCount) : 0,
    hasHistoricalUsage: Boolean(raw?.hasHistoricalUsage),
    canDelete: raw?.canDelete === true,
  };
}

async function readApiError(res: Response, fallback: string): Promise<TimesApiError> {
  const payload = (await res.json().catch(() => null)) as ApiErrorPayload | null;
  const code = payload?.code || payload?.error;
  const message = payload?.message || payload?.error || fallback;
  return new TimesApiError(message, code);
}

export function useTimes(tenantSlug?: string, options?: UseTimesOptions) {
  const slug = tenantSlug?.trim();
  const status = options?.status ?? "active";
  const params = new URLSearchParams();
  if (slug) params.set("slug", slug);
  if (status) params.set("status", status);
  const search = params.toString() ? `?${params.toString()}` : "";
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
      logoUrl: time.logoUrl !== undefined ? time.logoUrl : (time.logo ?? null),
    };

    const res = await fetch(`/api/times${search}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw await readApiError(res, "Falha ao criar time");
    }

    notifyAdminGuideChanged();
    await mutate();
  }

  async function updateTime(time: Time) {
    if (!slug) {
      throw new Error("Selecione o racha ativo antes de atualizar um time.");
    }
    const payload = {
      name: time.nome || time.name || "Time",
      color: time.cor || time.color || DEFAULT_COR,
      logoUrl: time.logoUrl !== undefined ? time.logoUrl : time.logo,
    };

    const res = await fetch(`/api/times/${time.id}${search}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw await readApiError(res, "Falha ao atualizar time");
    }

    notifyAdminGuideChanged();
    await mutate();
  }

  async function archiveTime(id: string) {
    if (!slug) {
      throw new Error("Selecione o racha ativo antes de arquivar um time.");
    }
    const res = await fetch(`/api/times/${id}/archive${search}`, {
      method: "POST",
    });

    if (!res.ok) {
      throw await readApiError(res, "Falha ao arquivar time");
    }

    notifyAdminGuideChanged();
    await mutate();
  }

  async function restoreTime(id: string) {
    if (!slug) {
      throw new Error("Selecione o racha ativo antes de reativar um time.");
    }
    const res = await fetch(`/api/times/${id}/restore${search}`, {
      method: "POST",
    });

    if (!res.ok) {
      throw await readApiError(res, "Falha ao reativar time");
    }

    notifyAdminGuideChanged();
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
      throw await readApiError(res, "Falha ao remover time");
    }

    notifyAdminGuideChanged();
    await mutate();
  }

  return {
    times: data || [],
    isLoading: isLoading || (!data && !error),
    isError: !!error,
    addTime,
    updateTime,
    deleteTime,
    archiveTime,
    restoreTime,
    mutate,
  };
}
