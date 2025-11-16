import useSWR from "swr";
import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRacha } from "@/context/RachaContext";
import type { CreateTorneioPayload, Torneio } from "@/types/torneio";

export function normalizeTorneio(raw: any): Torneio {
  return {
    id: String(raw?.id ?? ""),
    nome: raw?.nome ?? raw?.title ?? "Torneio",
    slug: raw?.slug ?? "",
    ano: Number(raw?.ano ?? raw?.year ?? new Date().getFullYear()),
    campeao: raw?.campeao ?? raw?.champion ?? null,
    descricao: raw?.descricao ?? raw?.description ?? null,
    descricaoResumida: raw?.descricaoResumida ?? raw?.descricaoShort ?? raw?.descricaoCurta ?? null,
    bannerUrl: raw?.bannerUrl ?? raw?.banner ?? null,
    logoUrl: raw?.logoUrl ?? raw?.logo ?? null,
    dataInicio: raw?.dataInicio ?? raw?.startDate ?? null,
    dataFim: raw?.dataFim ?? raw?.endDate ?? null,
    destacarNoSite: Boolean(raw?.destacarNoSite),
    status: raw?.status,
    publicadoEm: raw?.publicadoEm ?? null,
    tenantSlug: raw?.tenantSlug ?? null,
    jogadoresCampeoes: Array.isArray(raw?.jogadoresCampeoes)
      ? raw.jogadoresCampeoes.map((j: any) => ({
          id: j?.id,
          athleteId: j?.athleteId ?? null,
          athleteSlug: j?.athleteSlug ?? j?.slug ?? "",
          nome: j?.nome ?? j?.name ?? "",
          posicao: j?.posicao ?? j?.position ?? "",
          fotoUrl: j?.fotoUrl ?? j?.photoUrl ?? null,
        }))
      : [],
    criadoEm: raw?.createdAt ?? null,
    atualizadoEm: raw?.updatedAt ?? null,
  };
}

const fetcher = async (url: string): Promise<Torneio[]> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Falha ao carregar torneios");
  }
  const payload = await res.json();
  const items = Array.isArray(payload?.results)
    ? payload.results
    : Array.isArray(payload)
      ? payload
      : [];
  return items.map(normalizeTorneio);
};

export function useTorneios(tenantSlug?: string | null) {
  const { user } = useAuth();
  const { rachaId } = useRacha();

  const resolvedSlug = useMemo(() => {
    return tenantSlug ?? user?.tenantSlug ?? (rachaId || null);
  }, [tenantSlug, user?.tenantSlug, rachaId]);

  const listKey = resolvedSlug
    ? `/api/admin/torneios?slug=${encodeURIComponent(resolvedSlug)}`
    : null;

  const { data, error, mutate, isLoading } = useSWR<Torneio[]>(listKey, fetcher, {
    revalidateOnFocus: false,
  });

  const addTorneio = async (payload: CreateTorneioPayload) => {
    if (!resolvedSlug) {
      throw new Error("tenantSlug obrigatorio");
    }
    const response = await fetch("/api/admin/torneios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, tenantSlug: resolvedSlug }),
    });
    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      throw new Error(details.error ?? "Falha ao criar torneio");
    }
    await mutate();
    return response.json().catch(() => null);
  };

  const setDestaque = async (id: string, destacar = true) => {
    if (!resolvedSlug) {
      throw new Error("tenantSlug obrigatorio");
    }
    const response = await fetch(`/api/admin/torneios/${id}/destaque`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destacar, tenantSlug: resolvedSlug }),
    });
    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      throw new Error(details.error ?? "Falha ao atualizar destaque");
    }
    await mutate();
    return response.json().catch(() => null);
  };

  const updateTorneio = async (id: string, payload: Partial<Torneio>) => {
    if (!resolvedSlug) {
      throw new Error("tenantSlug obrigatorio");
    }
    const response = await fetch(`/api/admin/torneios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, tenantSlug: resolvedSlug }),
    });
    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      throw new Error(details.error ?? "Falha ao atualizar torneio");
    }
    await mutate();
    return response.json().catch(() => null);
  };

  const deleteTorneio = async (id: string) => {
    if (!resolvedSlug) {
      throw new Error("tenantSlug obrigatorio");
    }
    const response = await fetch(`/api/admin/torneios/${id}`, {
      method: "DELETE",
    });
    if (!response.ok && response.status !== 204) {
      const details = await response.json().catch(() => ({}));
      throw new Error(details.error ?? "Falha ao deletar torneio");
    }
    await mutate();
    return true;
  };

  return {
    torneios: data || [],
    isLoading: isLoading ?? false,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    addTorneio,
    updateTorneio,
    deleteTorneio,
    setDestaque,
    mutate,
  };
}
