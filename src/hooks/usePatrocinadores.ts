import { useMemo } from "react";
import useSWR from "swr";
import type { Patrocinador, PlanoPatrocinio, StatusPatrocinador } from "@/types/financeiro";

type SponsorApiItem = {
  id?: string;
  name?: string;
  logoUrl?: string;
  link?: string | null;
  ramo?: string | null;
  about?: string | null;
  coupon?: string | null;
  benefit?: string | null;
  value?: number | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  billingPlan?: PlanoPatrocinio | null;
  displayOrder?: number | null;
  tier?: string | null;
  showOnFooter?: boolean | null;
};

const DEFAULT_LOGO = "/images/patrocinadores/patrocinador_01.png";
const FUT7PRO_LOGO = "/images/logos/logo_fut7pro.png";
const SLOT_LIMIT = 10;

const fetcher = async (url: string): Promise<SponsorApiItem[]> => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || "Erro ao carregar patrocinadores");
  }
  return res.json();
};

const parseErrorMessage = async (res: Response, fallback: string) => {
  const text = await res.text();
  if (!text) return fallback;
  try {
    const data = JSON.parse(text);
    return data?.message || data?.error || fallback;
  } catch {
    return text;
  }
};

const normalizeDate = (value?: string | null) => {
  if (!value) return "";
  if (value.includes("T")) return value.slice(0, 10);
  return value;
};

const normalizePayloadDate = (value?: string | null) => {
  if (!value) return undefined;
  if (value.includes("T")) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
};

const computeStatus = (inicio?: string, fim?: string): StatusPatrocinador => {
  const now = new Date();
  const start = inicio ? new Date(inicio) : null;
  const end = fim ? new Date(fim) : null;
  if (end && end.getTime() < now.getTime()) return "encerrado";
  if (start && start.getTime() > now.getTime()) return "inativo";
  return "ativo";
};

const resolveLogoUrl = (rawLogo: string, fallbackLogo: string, isFut7Pro: boolean) => {
  const trimmed = rawLogo.trim();
  if (!trimmed) return isFut7Pro ? FUT7PRO_LOGO : fallbackLogo;
  if (trimmed.toLowerCase().includes("logo_fut7pro")) return FUT7PRO_LOGO;
  return trimmed;
};

const resolveDisplayOrder = (rawOrder: unknown, fallback: number) => {
  const parsed = typeof rawOrder === "number" ? rawOrder : Number(rawOrder);
  const order = Number.isFinite(parsed) ? Math.round(parsed) : fallback;
  return Math.min(Math.max(order, 1), SLOT_LIMIT);
};

const normalizeBillingPlan = (value?: PlanoPatrocinio | string | null): PlanoPatrocinio => {
  if (!value) return "MENSAL";
  const normalized = String(value).toUpperCase();
  if (normalized === "MENSAL" || normalized === "QUADRIMESTRAL" || normalized === "ANUAL") {
    return normalized as PlanoPatrocinio;
  }
  return "MENSAL";
};

const normalizeLink = (value?: string) => {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const normalizeSponsor = (item: SponsorApiItem, index: number): Patrocinador => {
  const periodoInicio = normalizeDate(item.periodStart);
  const periodoFim = normalizeDate(item.periodEnd);
  const descricao = item.about ?? item.benefit ?? item.coupon ?? undefined;
  const valor = typeof item.value === "number" ? item.value : Number(item.value ?? 0);
  const nome = String(item.name ?? "Patrocinador");
  const link = item.link ?? "";
  const isFut7Pro =
    nome.toLowerCase().includes("fut7pro") || link.toLowerCase().includes("fut7pro.com.br");
  const logo = resolveLogoUrl(item.logoUrl ?? "", DEFAULT_LOGO, isFut7Pro);
  const displayOrder = resolveDisplayOrder(item.displayOrder, index + 1);
  const billingPlan = normalizeBillingPlan(item.billingPlan ?? undefined);

  return {
    id: String(item.id ?? `patrocinador-${index}`),
    nome,
    valor: Number.isFinite(valor) ? valor : 0,
    periodoInicio,
    periodoFim,
    descricao,
    ramo: item.ramo ?? undefined,
    logo,
    status: computeStatus(periodoInicio, periodoFim),
    billingPlan,
    comprovantes: [],
    observacoes: descricao,
    link: item.link ?? undefined,
    visivel: item.showOnFooter ?? true,
    displayOrder,
  };
};

const buildSponsorPayload = (input: Partial<Patrocinador>) => {
  const nome = input.nome?.trim() || "";
  const logo = input.logo?.trim() || "";
  const descricao = input.observacoes?.trim() || input.descricao?.trim() || "";
  const ramo = input.ramo?.trim() || undefined;
  const link = normalizeLink(input.link);
  const valor = typeof input.valor === "number" ? input.valor : Number(input.valor ?? 0);
  const billingPlan = normalizeBillingPlan(input.billingPlan);

  return {
    name: nome,
    logoUrl: logo,
    link,
    ramo,
    value: Number.isFinite(valor) ? valor : 0,
    about: descricao || undefined,
    periodStart: normalizePayloadDate(input.periodoInicio),
    periodEnd: normalizePayloadDate(input.periodoFim),
    billingPlan,
    showOnFooter: input.visivel ?? true,
    displayOrder:
      typeof input.displayOrder === "number"
        ? resolveDisplayOrder(input.displayOrder, 1)
        : undefined,
  };
};

export function usePatrocinadores() {
  const { data, error, isLoading, mutate } = useSWR<SponsorApiItem[]>(
    "/api/admin/patrocinadores",
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const patrocinadores = useMemo(() => {
    const origem = Array.isArray(data) ? data : [];
    return origem
      .map(normalizeSponsor)
      .sort((a, b) => (a.displayOrder ?? SLOT_LIMIT + 1) - (b.displayOrder ?? SLOT_LIMIT + 1));
  }, [data]);

  async function addPatrocinador(p: Partial<Patrocinador>) {
    const payload = buildSponsorPayload(p);
    const res = await fetch("/api/admin/patrocinadores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(await parseErrorMessage(res, "Erro ao salvar patrocinador"));
    }
    mutate();
  }

  async function updatePatrocinador(p: Patrocinador) {
    const payload = buildSponsorPayload(p);
    const res = await fetch(`/api/admin/patrocinadores/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(await parseErrorMessage(res, "Erro ao atualizar patrocinador"));
    }
    mutate();
  }

  async function deletePatrocinador(id: string) {
    const res = await fetch(`/api/admin/patrocinadores/${id}`, { method: "DELETE" });
    if (!res.ok) {
      throw new Error(await parseErrorMessage(res, "Erro ao remover patrocinador"));
    }
    mutate();
  }

  return {
    patrocinadores,
    isLoading,
    isError: Boolean(error),
    addPatrocinador,
    updatePatrocinador,
    deletePatrocinador,
    mutate,
  };
}
