"use client";

import useSWR from "swr";
import type { PublicSponsor } from "@/types/sponsor";

const FUT7PRO_LOGO = "/images/logos/logo_fut7pro.png";
const SLOT_LIMIT = 10;
const SLOT_PLACEHOLDER_PREFIX = "/images/patrocinadores/patrocinador_";

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

function getDefaultLogoBySlot(order: number) {
  const slot = Math.min(Math.max(order, 1), SLOT_LIMIT);
  const slotNumber = String(slot).padStart(2, "0");
  return `${SLOT_PLACEHOLDER_PREFIX}${slotNumber}.png`;
}

function buildPlaceholderSponsor(order: number): PublicSponsor {
  const isFirstSlot = order === 1;
  return {
    id: `placeholder-slot-${order}`,
    name: isFirstSlot ? "Fut7Pro" : `Patrocinador ${String(order).padStart(2, "0")}`,
    logoUrl: isFirstSlot ? FUT7PRO_LOGO : getDefaultLogoBySlot(order),
    link: null,
    displayOrder: order,
    showOnFooter: true,
    status: "em_breve",
    isPlaceholder: true,
  };
}

const DEFAULT_SLOT_SPONSORS = Array.from({ length: SLOT_LIMIT }, (_, index) =>
  buildPlaceholderSponsor(index + 1)
);

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
  const displayOrder = resolveDisplayOrder(raw?.displayOrder ?? raw?.prioridade, index + 1);
  const rawLogo = String(raw?.logoUrl ?? raw?.logo ?? "");
  const fallbackLogo = getDefaultLogoBySlot(displayOrder);
  const link = raw?.link ?? null;
  const logoUrl = resolveLogoUrl(rawLogo, fallbackLogo, isFut7ProSponsor(name, link));

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
    isPlaceholder: false,
  };
}

type UsePublicSponsorsOptions = {
  fillDefaultSlots?: boolean;
};

function buildPublicSponsorSlots(sponsors: PublicSponsor[], fillDefaultSlots: boolean) {
  const visibleSponsors = sponsors
    .filter((sponsor) => sponsor.showOnFooter !== false)
    .sort((a, b) => (a.displayOrder ?? SLOT_LIMIT + 1) - (b.displayOrder ?? SLOT_LIMIT + 1));

  if (!fillDefaultSlots) return visibleSponsors.slice(0, SLOT_LIMIT);

  const slotsByOrder = new Map<number, PublicSponsor>();
  visibleSponsors.forEach((sponsor, index) => {
    const order = resolveDisplayOrder(sponsor.displayOrder, index + 1);
    if (!slotsByOrder.has(order)) {
      slotsByOrder.set(order, { ...sponsor, displayOrder: order, isPlaceholder: false });
    }
  });

  return DEFAULT_SLOT_SPONSORS.map((placeholder) => {
    const order = placeholder.displayOrder ?? 1;
    return slotsByOrder.get(order) ?? placeholder;
  });
}

export function usePublicSponsors(slug?: string, options: UsePublicSponsorsOptions = {}) {
  const resolvedSlug = slug?.trim() || "";
  const fillDefaultSlots = options.fillDefaultSlots ?? false;
  const key = resolvedSlug ? `/api/public/${resolvedSlug}/sponsors` : null;

  const { data, error, isLoading, mutate } = useSWR<PublicSponsor[]>(key, fetcher, {
    revalidateOnFocus: false,
  });

  const sponsors = Array.isArray(data) ? [...data] : [];
  const slots = buildPublicSponsorSlots(sponsors, fillDefaultSlots);
  const sortedSponsors = sponsors
    .filter((sponsor) => sponsor.showOnFooter !== false)
    .sort((a, b) => (a.displayOrder ?? SLOT_LIMIT + 1) - (b.displayOrder ?? SLOT_LIMIT + 1));

  return {
    sponsors: sortedSponsors,
    slots,
    isLoading,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}
