export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import {
  computePlayerStats,
  computeUpdatedAt,
  extractAvailableYears,
  filterPartidasByPeriodo,
} from "@/server/estatisticas/aggregator";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rachaId = searchParams.get("rachaId");
  if (!rachaId) {
    return NextResponse.json({ error: "rachaId is required" }, { status: 400 });
  }

  const periodo = searchParams.get("periodo") ?? "historico";
  const anoParam = searchParams.get("ano");
  const ano = anoParam ? Number(anoParam) : undefined;

  try {
    const partidas = await prisma.partida.findMany({
      where: {
        rachaId,
        finalizada: true,
      },
      orderBy: [{ data: "asc" }],
    });

    const availableYears = extractAvailableYears(partidas);
    const filtradas = filterPartidasByPeriodo(partidas, periodo, ano);
    const jogadores = computePlayerStats(filtradas);
    const updatedAt = computeUpdatedAt(filtradas) ?? computeUpdatedAt(partidas);

    return NextResponse.json({
      rachaId,
      periodo,
      ano: ano ?? null,
      availableYears,
      results: jogadores,
      updatedAt,
    });
  } catch (error) {
    console.error("GET /api/estatisticas/ranking-geral failed", error);
    return NextResponse.json({ error: "failed to compute ranking" }, { status: 500 });
  }
}
