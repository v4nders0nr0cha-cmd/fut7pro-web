export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

const DEFAULT_BACKEND_URL = "http://127.0.0.1:3333";
const SPONSOR_TAG_PREFIX = "sponsors";
const FOOTER_TAG_PREFIX = "footer";

type BackendSponsor = {
  id: string;
  name?: string | null;
  logoUrl?: string | null;
  link?: string | null;
  ramo?: string | null;
  about?: string | null;
  coupon?: string | null;
  benefit?: string | null;
  tier?: string | null;
  displayOrder?: number | null;
  showOnFooter?: boolean | null;
  periodStart?: string | null;
  periodEnd?: string | null;
};

function getBackendUrl() {
  const candidate =
    process.env.API_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_BACKEND_URL;
  return candidate.replace(/\/+$/, "");
}

function buildDefaultSponsor(slug: string) {
  const now = new Date().toISOString();
  return [
    {
      id: `default-fut7pro-${slug}`,
      name: "Fut7Pro",
      logoUrl: "https://app.fut7pro.com.br/images/logos/logo_fut7pro.png",
      link: "https://www.fut7pro.com.br",
      ramo: "Tecnologia para Rachas",
      about:
        "Sistema completo para gestão de rachas de Futebol 7: sorteio inteligente, rankings, site público, painel administrativo e patrocínios.",
      coupon: null,
      benefit: "Experimente o Fut7Pro gratuitamente e leve seu racha a outro nível.",
      tier: "PRO",
      displayOrder: 1,
      showOnFooter: true,
      periodStart: now,
      periodEnd: null,
    },
  ];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get("slug")?.trim().toLowerCase();
  if (!slug) {
    return NextResponse.json({ error: "slug requerido" }, { status: 400 });
  }

  const backendUrl = `${getBackendUrl()}/sponsors/public?slug=${encodeURIComponent(slug)}`;

  try {
    const response = await fetch(backendUrl, {
      headers: { "content-type": "application/json" },
      next: {
        revalidate: 900, // 15 minutos
        tags: [`${SPONSOR_TAG_PREFIX}:${slug}`, `${FOOTER_TAG_PREFIX}:${slug}`],
      },
    });

    if (!response.ok) {
      throw new Error(`backend_error:${response.status}`);
    }

    const data = (await response.json()) as BackendSponsor[] | { data: BackendSponsor[] };
    const sponsors = Array.isArray(data) ? data : Array.isArray((data as any).data) ? (data as any).data : [];

    if (!Array.isArray(sponsors) || sponsors.length === 0) {
      return NextResponse.json(
        {
          data: buildDefaultSponsor(slug),
          fallback: true,
          source: "fallback_default",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        data: sponsors,
        fallback: false,
        source: "backend",
      },
      { status: 200 }
    );
  } catch (error) {
    const fallback = buildDefaultSponsor(slug);
    return NextResponse.json(
      {
        data: fallback,
        fallback: true,
        source: "fallback_error",
        error: error instanceof Error ? error.message : "unexpected_error",
      },
      { status: 200 }
    );
  }
}
