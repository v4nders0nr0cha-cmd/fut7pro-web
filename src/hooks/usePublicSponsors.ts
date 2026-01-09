"use client";

import useSWR from "swr";
import { rachaConfig } from "@/config/racha.config";
import type { PublicSponsor } from "@/types/sponsor";

const FUT7PRO_LOGO = "/images/logos/logo_fut7pro.png";
const DEFAULT_SPONSOR_LOGOS = [
  "/images/patrocinadores/patrocinador_01.png",
  "/images/patrocinadores/patrocinador_02.png",
  "/images/patrocinadores/patrocinador_03.png",
  "/images/patrocinadores/patrocinador_04.png",
  "/images/patrocinadores/patrocinador_05.png",
  "/images/patrocinadores/patrocinador_06.png",
  "/images/patrocinadores/patrocinador_07.png",
  "/images/patrocinadores/patrocinador_08.png",
  "/images/patrocinadores/patrocinador_09.png",
  "/images/patrocinadores/patrocinador_10.png",
];

const buildFallbackSponsors = (): PublicSponsor[] =>
  DEFAULT_SPONSOR_LOGOS.map((logoUrl, index) => ({
    id: `placeholder-${index + 1}`,
    name: `Patrocinador ${String(index + 1).padStart(2, "0")}`,
    logoUrl,
    link: null,
    showOnFooter: true,
    isPlaceholder: true,
  }));

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
  if (Array.isArray(payload)) return payload.map(normalizeSponsor);
  if (Array.isArray(payload?.results)) return payload.results.map(normalizeSponsor);
  return [];
};

function resolveLogoUrl(rawLogo: string, fallbackLogo: string, isFut7Pro: boolean) {
  const trimmed = rawLogo.trim();
  if (!trimmed) return isFut7Pro ? FUT7PRO_LOGO : fallbackLogo;
  if (trimmed.toLowerCase().includes("logo_fut7pro")) return FUT7PRO_LOGO;
  return trimmed;
}

function normalizeSponsor(raw: any, index: number): PublicSponsor {
  const name = String(raw?.name ?? raw?.nome ?? "Patrocinador");
  const rawLogo = String(raw?.logoUrl ?? raw?.logo ?? "");
  const fallbackLogo = DEFAULT_SPONSOR_LOGOS[index % DEFAULT_SPONSOR_LOGOS.length];
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
    displayOrder: raw?.displayOrder ?? raw?.prioridade ?? null,
    tier: raw?.tier ?? raw?.plano ?? null,
    showOnFooter: raw?.showOnFooter ?? raw?.visivel ?? null,
    status: raw?.status ?? null,
  };
}

export function usePublicSponsors(slug?: string) {
  const resolvedSlug = slug || rachaConfig.slug;
  const key = resolvedSlug ? `/api/public/${resolvedSlug}/sponsors` : null;

  const { data, error, isLoading, mutate } = useSWR<PublicSponsor[]>(key, fetcher, {
    revalidateOnFocus: false,
  });

  const sponsors = Array.isArray(data) && data.length > 0 ? data : buildFallbackSponsors();

  return {
    sponsors,
    isLoading,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}
