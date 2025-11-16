import { NextRequest } from "next/server";
import { diagHeaders } from "@/lib/api-headers";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type PublicSponsor = {
  id: string;
  name: string;
  logoUrl: string;
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
  status?: string | null;
};

const FALLBACK_SPONSORS: PublicSponsor[] = [
  {
    id: "fallback-fut7pro",
    name: "Fut7Pro",
    logoUrl: "https://app.fut7pro.com.br/images/logos/logo_fut7pro.png",
    link: "https://www.fut7pro.com.br",
    ramo: "Tecnologia para Rachas",
    about:
      "Sistema completo para gestão de rachas de Futebol 7: sorteio inteligente, rankings, site público e painel administrativo.",
    tier: "PRO",
    showOnFooter: true,
    status: "ativo",
  },
];

function buildFallbackResponse(status: number, reason?: unknown) {
  if (process.env.NODE_ENV === "development" && reason) {
    console.warn("Fallback de sponsors acionado:", reason);
  }

  return new Response(JSON.stringify(FALLBACK_SPONSORS), {
    status,
    headers: {
      ...diagHeaders("static"),
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export async function GET(req: NextRequest) {
  let base: string;
  try {
    base = getApiBase();
  } catch (error) {
    return buildFallbackResponse(200, error);
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug")?.trim() ?? "";
  const effectiveSlug = slug || req.headers.get("x-tenant-slug") || "";

  const search = new URLSearchParams();
  if (effectiveSlug) {
    search.set("slug", effectiveSlug);
  }

  const upstream = `${base}/sponsors/public${search.toString() ? `?${search.toString()}` : ""}`;

  try {
    const response = await fetch(upstream, {
      method: "GET",
      headers: {
        accept: "application/json",
        ...(effectiveSlug ? { "x-tenant-slug": effectiveSlug } : {}),
      },
      cache: "no-store",
    });

    const text = await response.text().catch(() => "");

    if (!response.ok) {
      return buildFallbackResponse(response.status, {
        status: response.status,
        body: text.slice(0, 200),
      });
    }

    return new Response(text, {
      status: 200,
      headers: {
        ...diagHeaders("backend"),
        "Content-Type": response.headers.get("content-type") ?? "application/json; charset=utf-8",
      },
    });
  } catch (error) {
    return buildFallbackResponse(200, error);
  }
}
