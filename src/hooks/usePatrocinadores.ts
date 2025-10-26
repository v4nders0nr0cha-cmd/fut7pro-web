"use client";

import useSWR from "swr";
import type { Patrocinador } from "@/types/patrocinador";
import { sponsorsApi } from "@/lib/api";
import { rachaConfig } from "@/config/racha.config";

type BackendSponsor = {
  id: string;
  name?: string | null;
  logoUrl?: string | null;
  link?: string | null;
  ramo?: string | null;
  about?: string | null;
  coupon?: string | null;
  benefit?: string | null;
  value?: number | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  displayOrder?: number | null;
  tier?: string | null;
  showOnFooter?: boolean | null;
  tenantId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  createdById?: string | null;
  updatedById?: string | null;
};

function normalizeDateInput(value?: string | Date | null): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return undefined;
    return value.toISOString();
  }
  const trimmed = String(value).trim();
  if (!trimmed) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

function normalizeNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const maybe = Number(value);
  return Number.isFinite(maybe) ? maybe : undefined;
}

function toLowerTier(tier?: string | null): "basic" | "plus" | "pro" {
  const normalized = tier?.toString().toLowerCase();
  if (normalized === "pro" || normalized === "plus") return normalized;
  return "basic";
}

function computeStatus(showOnFooter: boolean | null | undefined, periodEnd?: string | null) {
  if (periodEnd) {
    const end = new Date(periodEnd);
    if (!Number.isNaN(end.getTime()) && end.getTime() < Date.now()) {
      return "inativo";
    }
  }
  return showOnFooter === false ? "inativo" : "ativo";
}

function mapFromBackend(item: BackendSponsor, fallbackSlug: string): Patrocinador {
  const periodoInicio = item.periodStart
    ? normalizeDateInput(item.periodStart) ?? undefined
    : undefined;
  const periodoFim = item.periodEnd ? normalizeDateInput(item.periodEnd) ?? undefined : undefined;
  const tier = toLowerTier(item.tier);

  return {
    id: item.id,
    nome: item.name ?? "",
    logo: item.logoUrl ?? "",
    link: item.link ?? "",
    prioridade: item.displayOrder ?? 1,
    status: computeStatus(item.showOnFooter, item.periodEnd),
    descricao: item.about ?? undefined,
    rachaId: item.tenantId ?? fallbackSlug,
    criadoEm: item.createdAt ?? undefined,
    atualizadoEm: item.updatedAt ?? undefined,
    ramo: item.ramo ?? undefined,
    sobre: item.about ?? undefined,
    cupom: item.coupon ?? undefined,
    beneficio: item.benefit ?? undefined,
    valor: normalizeNumber(item.value),
    periodoInicio,
    periodoFim,
    displayOrder: item.displayOrder ?? 1,
    tier,
    showOnFooter: Boolean(item.showOnFooter),
    createdById: item.createdById ?? undefined,
    updatedById: item.updatedById ?? undefined,
  };
}

function buildCreatePayload(p: Partial<Patrocinador>) {
  if (!p.nome?.trim()) throw new Error("Nome do patrocinador e obrigatorio.");
  if (!p.logo?.trim()) throw new Error("Logo do patrocinador e obrigatorio.");
  const payload: Record<string, unknown> = {
    name: p.nome.trim(),
    logoUrl: p.logo.trim(),
  };
  if (p.link) payload.link = p.link;
  if (p.ramo) payload.ramo = p.ramo;
  const about = p.sobre ?? p.descricao;
  if (about) payload.about = about;
  if (p.cupom) payload.coupon = p.cupom;
  if (p.beneficio) payload.benefit = p.beneficio;
  if (p.valor !== undefined) {
    const value = normalizeNumber(p.valor);
    if (value !== undefined) payload.value = value;
  }
  const periodStart = normalizeDateInput(p.periodoInicio);
  if (periodStart) payload.periodStart = periodStart;
  const periodEnd = normalizeDateInput(p.periodoFim);
  if (periodEnd) payload.periodEnd = periodEnd;
  const order = p.displayOrder ?? p.prioridade;
  if (order !== undefined) payload.displayOrder = order;
  payload.tier = (p.tier ?? "basic").toUpperCase();
  const visibility =
    p.showOnFooter !== undefined ? Boolean(p.showOnFooter) : (p.status ?? "ativo") !== "inativo";
  payload.showOnFooter = visibility;
  return payload;
}

function buildUpdatePayload(p: Partial<Patrocinador>) {
  const payload: Record<string, unknown> = {};
  if (p.nome !== undefined) {
    const trimmed = p.nome.trim();
    if (!trimmed) throw new Error("Nome do patrocinador e obrigatorio.");
    payload.name = trimmed;
  }
  if (p.logo !== undefined) {
    const trimmed = p.logo.trim();
    if (!trimmed) throw new Error("Logo do patrocinador e obrigatorio.");
    payload.logoUrl = trimmed;
  }
  if (p.link !== undefined) payload.link = p.link || null;
  if (p.ramo !== undefined) payload.ramo = p.ramo || null;
  const about = p.sobre ?? p.descricao;
  if (about !== undefined) payload.about = about || null;
  if (p.cupom !== undefined) payload.coupon = p.cupom || null;
  if (p.beneficio !== undefined) payload.benefit = p.beneficio || null;
  if (p.valor !== undefined) {
    const value = normalizeNumber(p.valor);
    payload.value = value ?? null;
  }
  if (p.periodoInicio !== undefined) {
    const periodStart = normalizeDateInput(p.periodoInicio);
    payload.periodStart = periodStart ?? null;
  }
  if (p.periodoFim !== undefined) {
    const periodEnd = normalizeDateInput(p.periodoFim);
    payload.periodEnd = periodEnd ?? null;
  }
  if (p.displayOrder !== undefined || p.prioridade !== undefined) {
    payload.displayOrder = p.displayOrder ?? p.prioridade ?? 1;
  }
  if (p.tier !== undefined) {
    payload.tier = (p.tier ?? "basic").toUpperCase();
  }
  if (p.showOnFooter !== undefined || p.status !== undefined) {
    const visibility =
      p.showOnFooter !== undefined
        ? Boolean(p.showOnFooter)
        : (p.status ?? "ativo") !== "inativo";
    payload.showOnFooter = visibility;
  }
  return payload;
}

export function usePatrocinadores(tenantSlug?: string) {
  const slug = tenantSlug?.trim() || rachaConfig.slug;
  const swrKey = slug ? ["sponsors-admin", slug] : null;

  const { data, error, mutate, isLoading } = useSWR<Patrocinador[]>(
    swrKey,
    async () => {
      let arr: BackendSponsor[] = [];
      const adminRes = await sponsorsApi.list();
      if (!adminRes.error && Array.isArray(adminRes.data)) {
        arr = adminRes.data as BackendSponsor[];
      } else if (slug) {
        const pub = await sponsorsApi.publicList(slug);
        if (!pub.error && Array.isArray(pub.data)) {
          arr = pub.data as BackendSponsor[];
        }
        if (arr.length === 0 && adminRes.error) {
          throw new Error(adminRes.error);
        }
      } else if (adminRes.error) {
        throw new Error(adminRes.error);
      }

      const mapped = arr.map((item) => mapFromBackend(item, slug));
      const tierWeight = (tier?: string) => (tier === "pro" ? 3 : tier === "plus" ? 2 : 1);
      mapped.sort((a, b) => {
        const diff = tierWeight(b.tier) - tierWeight(a.tier);
        if (diff !== 0) return diff;
        return (a.displayOrder ?? 1) - (b.displayOrder ?? 1);
      });

      if (mapped.length === 0) {
        const nowIso = new Date().toISOString();
        mapped.push({
          id: "default-fut7pro",
          nome: "Fut7Pro",
          logo: rachaConfig.logo || "/images/logos/logo_fut7pro.png",
          link: "https://www.fut7pro.com.br",
          prioridade: 1,
          status: "ativo",
          descricao: "Sistema completo para gestao de rachas de Futebol 7.",
          rachaId: slug,
          criadoEm: nowIso,
          atualizadoEm: nowIso,
          displayOrder: 1,
          tier: "pro",
          showOnFooter: true,
        });
      }

      return mapped;
    },
    { revalidateOnFocus: false }
  );

  async function addPatrocinador(p: Partial<Patrocinador>) {
    const payload = buildCreatePayload(p);
    const res = await sponsorsApi.create(payload);
    if (res.error) throw new Error(res.error);
    await mutate();
  }

  async function updatePatrocinador(p: Partial<Patrocinador>) {
    if (!p?.id) throw new Error("Patrocinador sem identificador.");
    const payload = buildUpdatePayload(p);
    if (Object.keys(payload).length === 0) return;
    const res = await sponsorsApi.update(p.id, payload);
    if (res.error) throw new Error(res.error);
    await mutate();
  }

  async function deletePatrocinador(id: string) {
    if (!id) return;
    const res = await sponsorsApi.remove(id);
    if (res.error) throw new Error(res.error);
    await mutate();
  }

  return {
    patrocinadores: data || [],
    isLoading: Boolean(isLoading ?? (!error && !data)),
    isError: !!error,
    addPatrocinador,
    updatePatrocinador,
    deletePatrocinador,
    mutate,
  };
}
