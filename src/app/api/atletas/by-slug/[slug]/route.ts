export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { obterAtletaPorSlug } from "@/server/atletas/aggregator";
import { prisma } from "@/server/prisma";

const isProd = process.env.NODE_ENV === "production";
const isWebDirectDbDisabled =
  process.env.DISABLE_WEB_DIRECT_DB === "true" || process.env.DISABLE_WEB_DIRECT_DB === "1";

async function resolveRachaId(rachaId: string | null, slug: string | null): Promise<string | null> {
  if (rachaId) return rachaId;
  if (!slug) return null;

  const record = await prisma.racha.findUnique({
    where: { slug },
    select: { id: true },
  });

  return record?.id ?? null;
}

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  if (isProd && isWebDirectDbDisabled) {
    return NextResponse.json(
      { error: "web_db_disabled: use a API do backend para atletas/by-slug" },
      { status: 501 }
    );
  }
  const { searchParams } = new URL(request.url);
  const rachaIdParam = searchParams.get("rachaId");
  const tenantSlug = searchParams.get("tenant");

  try {
    const rachaId = await resolveRachaId(rachaIdParam, tenantSlug);
    if (!rachaId) {
      return NextResponse.json({ error: "rachaId or tenant slug is required" }, { status: 400 });
    }

    const atleta = await obterAtletaPorSlug(rachaId, params.slug);
    if (!atleta) {
      return NextResponse.json({ error: "athlete not found" }, { status: 404 });
    }

    return NextResponse.json({ atleta });
  } catch (error) {
    console.error("GET /api/atletas/by-slug/[slug] failed", error);
    return NextResponse.json({ error: "failed to fetch athlete" }, { status: 500 });
  }
}
