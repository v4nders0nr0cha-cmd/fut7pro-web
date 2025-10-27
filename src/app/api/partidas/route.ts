export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
const isProd = process.env.NODE_ENV === "production";
const isWebDirectDbDisabled =
  process.env.DISABLE_WEB_DIRECT_DB === "true" || process.env.DISABLE_WEB_DIRECT_DB === "1";
import type { Partida as PartidaResponse } from "@/types/partida";

function toStartOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function toEndOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

export async function GET(request: Request) {
  if (isProd && isWebDirectDbDisabled) {
    return NextResponse.json(
      { error: "web_db_disabled: use a API do backend para partidas" },
      { status: 501 }
    );
  }
  const { searchParams } = new URL(request.url);
  const rachaId = searchParams.get("rachaId");
  if (!rachaId) {
    return NextResponse.json({ error: "rachaId is required" }, { status: 400 });
  }

  const dateParam = searchParams.get("data");
  let dateFilter: { gte: Date; lte: Date } | undefined;

  if (dateParam) {
    const parsed = new Date(dateParam);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: "invalid date" }, { status: 400 });
    }
    dateFilter = {
      gte: toStartOfDay(parsed),
      lte: toEndOfDay(parsed),
    };
  }

  try {
    const partidas = await prisma.partida.findMany({
      where: {
        rachaId,
        ...(dateFilter ? { data: dateFilter } : {}),
      },
      orderBy: [{ data: "desc" }, { horario: "desc" }],
    });

    const payload: PartidaResponse[] = partidas.map((partida) => ({
      id: partida.id,
      rachaId: partida.rachaId,
      data: partida.data.toISOString(),
      horario: partida.horario,
      timeA: partida.timeA,
      timeB: partida.timeB,
      golsTimeA: partida.golsTimeA,
      golsTimeB: partida.golsTimeB,
      jogadoresA: partida.jogadoresA,
      jogadoresB: partida.jogadoresB,
      finalizada: partida.finalizada,
      criadoEm: partida.criadoEm.toISOString(),
      atualizadoEm: partida.atualizadoEm.toISOString(),
      ...(partida.local ? { local: partida.local } : {}),
      ...(partida.destaquesA ? { destaquesA: partida.destaquesA } : {}),
      ...(partida.destaquesB ? { destaquesB: partida.destaquesB } : {}),
    }));

    return NextResponse.json(payload);
  } catch (error) {
    console.error("GET /api/partidas failed", error);
    return NextResponse.json({ error: "failed to fetch matches" }, { status: 500 });
  }
}
