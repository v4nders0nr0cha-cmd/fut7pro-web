"use client";

import useSWR from "swr";
import type { PublicSponsor } from "@/types/sponsor";

const FUT7PRO_LOGO = "/images/logos/logo_fut7pro.png";
const SLOT_LIMIT = 10;

const isFut7ProSponsor = (name: string, link?: string | null) => {
  const lowerName = name.toLowerCase();
  const lowerLink = (link || "").toLowerCase();
  return lowerName.includes("fut7pro") || lowerLink.includes("fut7pro.com.br");
};

const fetcher = async (url: string): Promise<PublicSponsor[]> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Erro ao carregar patrocinadores");
  }
  const payload = await res.json();
  if (Array.isArray(payload)) return payload.map((item, index) => normalizeSponsor(item, index));
  if (Array.isArray(payload?.results))
    return payload.results.map((item: any, index: number) => normalizeSponsor(item, index));
  if (payload && typeof payload === "object") return [normalizeSponsor(payload, 0)];
  return [];
};

function resolveLogoUrl(rawLogo: string, fallbackLogo: string, isFut7Pro: boolean) {
  const trimmed = rawLogo.trim();
  if (!trimmed) return isFut7Pro ? FUT7PRO_LOGO : fallbackLogo;
  if (trimmed.toLowerCase().includes("logo_fut7pro")) return FUT7PRO_LOGO;
  return trimmed;
}

function resolveDisplayOrder(rawOrder: unknown, fallback: number) {
  const parsed = typeof rawOrder === "number" ? rawOrder : Number(rawOrder);
  const order = Number.isFinite(parsed) ? Math.round(parsed) : fallback;
  return Math.min(Math.max(order, 1), SLOT_LIMIT);
}

function normalizeSponsor(raw: any, index: number): PublicSponsor {
  const name = String(raw?.name ?? raw?.nome ?? "Patrocinador");
  const rawLogo = String(raw?.logoUrl ?? raw?.logo ?? "");
  const fallbackLogo = FUT7PRO_LOGO;
  const link = raw?.link ?? null;
  const logoUrl = resolveLogoUrl(rawLogo, fallbackLogo, isFut7ProSponsor(name, link));
  const displayOrder = resolveDisplayOrder(raw?.displayOrder ?? raw?.prioridade, index + 1);

  return {
    id: String(raw?.id ?? name),
    name,
    logoUrl,
    link,
    ramo: raw?.ramo ?? raw?.categoria ?? null,
    about: raw?.about ?? raw?.descricao ?? null,
    benefit: raw?.benefit ?? raw?.beneficio ?? null,
    coupon: raw?.coupon ?? raw?.cupom ?? null,
    value: raw?.value ?? raw?.valor ?? null,
    periodStart: raw?.periodStart ?? raw?.periodoInicio ?? null,
    periodEnd: raw?.periodEnd ?? raw?.periodoFim ?? null,
    displayOrder,
    tier: raw?.tier ?? raw?.plano ?? null,
    showOnFooter: raw?.showOnFooter ?? raw?.visivel ?? null,
    status: raw?.status ?? null,
  };
}

export function usePublicSponsors(slug?: string) {
  const resolvedSlug = slug?.trim() || "";
  const key = resolvedSlug ? `/api/public/${resolvedSlug}/sponsors` : null;

  const { data, error, isLoading, mutate } = useSWR<PublicSponsor[]>(key, fetcher, {
    revalidateOnFocus: false,
  });

  const sponsors = Array.isArray(data)
    ? [...data]
        .filter((sponsor) => sponsor.showOnFooter !== false)
        .sort((a, b) => (a.displayOrder ?? SLOT_LIMIT + 1) - (b.displayOrder ?? SLOT_LIMIT + 1))
    : [];
  const slots = sponsors.slice(0, SLOT_LIMIT);

  return {
    sponsors,
    slots,
    isLoading,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}
