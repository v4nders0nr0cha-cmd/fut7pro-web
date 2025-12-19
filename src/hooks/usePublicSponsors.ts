"use client";

import useSWR from "swr";
import { rachaConfig } from "@/config/racha.config";
import type { PublicSponsor } from "@/types/sponsor";

const DEFAULT_LOGO = "/images/logos/logo_fut7pro.png";

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

function normalizeSponsor(raw: any): PublicSponsor {
  const name = String(raw?.name ?? raw?.nome ?? "Patrocinador");
  const rawLogo = String(raw?.logoUrl ?? raw?.logo ?? "");
  const logoUrl = rawLogo.trim().length > 0 ? rawLogo : DEFAULT_LOGO;

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

  return {
    sponsors: data ?? [],
    isLoading,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}
