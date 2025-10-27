export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";
import { listarAtletasPorRacha } from "@/server/atletas/aggregator";
import type { Atleta } from "@/types/atletas";

const isProd = process.env.NODE_ENV === "production";
const isWebDirectDbDisabled =
  process.env.DISABLE_WEB_DIRECT_DB === "true" || process.env.DISABLE_WEB_DIRECT_DB === "1";

const TEST_EMAIL = process.env.TEST_EMAIL?.toLowerCase();
const TEST_PASSWORD = process.env.TEST_PASSWORD;
const TEST_MODE = Boolean(TEST_EMAIL && TEST_PASSWORD);
const TEST_TENANT_ID = process.env.TEST_TENANT_ID ?? "fut7pro";
const TEST_TENANT_SLUG = process.env.TEST_TENANT_SLUG ?? TEST_TENANT_ID;
const TEST_USER_ID = process.env.TEST_USER_ID ?? "test-admin";
const TEST_USER_NAME = process.env.TEST_USER_NAME ?? "Administrador Demo";
const TEST_USER_SLUG = process.env.TEST_USER_SLUG ?? "admin-demo";

function buildTestAtleta(): Atleta {
  return {
    id: TEST_USER_ID,
    nome: TEST_USER_NAME,
    apelido: "Admin Demo",
    slug: TEST_USER_SLUG,
    foto: "/images/jogadores/jogador_padrao_01.jpg",
    posicao: "Atacante",
    status: "Ativo",
    mensalista: true,
    ultimaPartida: undefined,
    totalJogos: 0,
    estatisticas: {
      historico: {
        jogos: 0,
        gols: 0,
        assistencias: 0,
        campeaoDia: 0,
        mediaVitorias: 0,
        pontuacao: 0,
      },
      anual: {},
    },
    historico: [],
    conquistas: {
      titulosGrandesTorneios: [],
      titulosAnuais: [],
      titulosQuadrimestrais: [],
    },
    icones: [],
  };
}

async function resolveRachaId(rachaId: string | null, slug: string | null) {
  if (rachaId) return rachaId;
  if (!slug) return null;
  if (TEST_MODE && slug === TEST_TENANT_SLUG) {
    return TEST_TENANT_ID;
  }
  const record = await prisma.racha.findUnique({ where: { slug }, select: { id: true } });
  return record?.id ?? null;
}

export async function GET(request: Request) {
  if (isProd && isWebDirectDbDisabled) {
    return NextResponse.json(
      { error: "web_db_disabled: use a API do backend para atletas" },
      { status: 501 }
    );
  }
  const { searchParams } = new URL(request.url);
  const rachaIdParam = searchParams.get("rachaId");
  const slugParam = searchParams.get("slug");

  try {
    const rachaId = await resolveRachaId(rachaIdParam, slugParam);
    if (!rachaId) {
      return NextResponse.json({ error: "rachaId or slug is required" }, { status: 400 });
    }

    if (
      TEST_MODE &&
      (rachaId === TEST_TENANT_ID ||
        slugParam === TEST_TENANT_SLUG ||
        (!slugParam && !rachaIdParam))
    ) {
      return NextResponse.json({ resultados: [buildTestAtleta()] });
    }

    const atletas = await listarAtletasPorRacha(rachaId);
    return NextResponse.json({ resultados: atletas });
  } catch (error) {
    console.error("GET /api/atletas failed", error);
    return NextResponse.json({ error: "failed to fetch athletes" }, { status: 500 });
  }
}
