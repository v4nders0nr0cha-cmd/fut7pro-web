import { NextRequest, NextResponse } from "next/server";
import { PRISMA_DISABLED_MESSAGE, isDirectDbBlocked } from "@/lib/prisma";

const shouldBlock = isDirectDbBlocked;

async function getDevPrisma() {
  const g = globalThis as unknown as { prisma?: any };
  if (!g.prisma) {
    const { PrismaClient } = await import("@prisma/client");
    g.prisma = new PrismaClient();
  }
  return g.prisma as any;
}

async function resolveRachaId(
  prisma: any,
  rachaId?: string | null,
  slug?: string | null
): Promise<string | null> {
  if (rachaId && rachaId.length > 0) {
    return rachaId;
  }
  if (slug && slug.length > 0) {
    const racha = await prisma.racha.findFirst({
      where: { slug },
      select: { id: true },
    });
    return racha?.id ?? null;
  }
  return null;
}

export async function GET(req: NextRequest) {
  if (shouldBlock) {
    return NextResponse.json({ error: PRISMA_DISABLED_MESSAGE }, { status: 501 });
  }

  const prisma = await getDevPrisma();
  const { searchParams } = new URL(req.url);
  const rachaId = await resolveRachaId(
    prisma,
    searchParams.get("rachaId"),
    searchParams.get("tenantSlug") ?? searchParams.get("slug")
  );

  if (!rachaId) {
    return NextResponse.json({ error: "tenantSlug ou rachaId obrigatorio" }, { status: 400 });
  }

  const estrelas = await prisma.AvaliacaoEstrela.findMany({
    where: { rachaId },
    select: {
      id: true,
      rachaId: true,
      jogadorId: true,
      estrelas: true,
      atualizadoPor: true,
      atualizadoEm: true,
    },
  });

  return NextResponse.json(estrelas);
}

export async function POST(req: NextRequest) {
  if (shouldBlock) {
    return NextResponse.json({ error: PRISMA_DISABLED_MESSAGE }, { status: 501 });
  }

  const prisma = await getDevPrisma();
  const body = await req.json();
  const { rachaId: bodyRachaId, tenantSlug, jogadorId, estrelas } = body ?? {};

  const rachaId = await resolveRachaId(prisma, bodyRachaId, tenantSlug);
  if (!rachaId || !jogadorId || typeof estrelas !== "number") {
    return NextResponse.json({ error: "Campos obrigatorios faltando" }, { status: 400 });
  }

  if (estrelas < 0 || estrelas > 5) {
    return NextResponse.json({ error: "Estrelas deve estar entre 0 e 5" }, { status: 400 });
  }

  const result = await prisma.AvaliacaoEstrela.upsert({
    where: {
      rachaId_jogadorId: { rachaId, jogadorId },
    },
    update: {
      estrelas,
      atualizadoEm: new Date(),
    },
    create: {
      rachaId,
      jogadorId,
      estrelas,
      atualizadoEm: new Date(),
    },
  });

  return NextResponse.json(result);
}
