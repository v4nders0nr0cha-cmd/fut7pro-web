"use client";

import useSWR from "swr";
import { rachaConfig } from "@/config/racha.config";
import type { PublicSponsor } from "@/types/sponsor";

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

const isDefaultSponsor = (sponsor: PublicSponsor) => {
  const name = sponsor.name.toLowerCase();
  const link = (sponsor.link || "").toLowerCase();
  return name.includes("fut7pro") || link.includes("fut7pro.com.br");
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

function normalizeSponsor(raw: any, index: number): PublicSponsor {
  const name = String(raw?.name ?? raw?.nome ?? "Patrocinador");
  const rawLogo = String(raw?.logoUrl ?? raw?.logo ?? "");
  const fallbackLogo = DEFAULT_SPONSOR_LOGOS[index % DEFAULT_SPONSOR_LOGOS.length];
  const logoUrl = rawLogo.trim().length > 0 ? rawLogo : fallbackLogo;

  return {
    id: String(raw?.id ?? name),
    name,
    logoUrl,
    link: raw?.link ?? null,
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

  const sponsors = Array.isArray(data)
    ? (() => {
        const realSponsors = data.filter((sponsor) => !isDefaultSponsor(sponsor));
        if (data.length === 0 || realSponsors.length === 0) {
          return buildFallbackSponsors();
        }
        return realSponsors.filter((sponsor) => sponsor.showOnFooter !== false);
      })()
    : [];

  return {
    sponsors,
    isLoading,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}
