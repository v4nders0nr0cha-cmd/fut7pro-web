export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { listarAtletasPorRacha } from "@/server/atletas/aggregator";

async function resolveRachaId(rachaId: string | null, slug: string | null) {
  if (rachaId) return rachaId;
  if (!slug) return null;
  const record = await prisma.racha.findUnique({ where: { slug }, select: { id: true } });
  return record?.id ?? null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rachaIdParam = searchParams.get("rachaId");
  const slugParam = searchParams.get("slug");

  try {
    const rachaId = await resolveRachaId(rachaIdParam, slugParam);
    if (!rachaId) {
      return NextResponse.json({ error: "rachaId or slug is required" }, { status: 400 });
    }

    const atletas = await listarAtletasPorRacha(rachaId);
    return NextResponse.json({ resultados: atletas });
  } catch (error) {
    console.error("GET /api/atletas failed", error);
    return NextResponse.json({ error: "failed to fetch athletes" }, { status: 500 });
  }
}
