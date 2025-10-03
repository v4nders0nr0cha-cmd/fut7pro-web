export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/prisma";

import type { Campeao as CampeaoModel } from "@prisma/client";

function parseJogadores(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((item) => {
        if (typeof item === "string") {
          return item.trim();
        }
        if (item && typeof item === "object" && "nome" in item && typeof item.nome === "string") {
          return item.nome.trim();
        }
        return "";
      })
      .filter((value) => value.length > 0);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to parse campeoes jogadores", error);
    }
    return [];
  }
}

function sanitizeJogadores(input: unknown): string[] {
  if (!input) return [];
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => (typeof item === "string" ? item : String(item ?? "")))
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function mapCampeao(record: CampeaoModel) {
  return {
    id: record.id,
    rachaId: record.rachaId,
    nome: record.nome,
    categoria: record.categoria,
    data: record.data.toISOString(),
    descricao: record.descricao ?? null,
    jogadores: parseJogadores(record.jogadores),
    imagem: record.imagem ?? null,
    criadoEm: record.criadoEm.toISOString(),
    atualizadoEm: record.atualizadoEm.toISOString(),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rachaId = searchParams.get("rachaId");
  if (!rachaId) {
    return NextResponse.json({ error: "rachaId is required" }, { status: 400 });
  }

  const categoria = searchParams.get("categoria");
  const takeParam = searchParams.get("take");
  const take = takeParam ? Number(takeParam) : undefined;

  try {
    const campeoes = await prisma.campeao.findMany({
      where: {
        rachaId,
        ...(categoria ? { categoria } : {}),
      },
      orderBy: [{ data: "desc" }, { criadoEm: "desc" }],
      ...(Number.isFinite(take) && take ? { take } : {}),
    });

    return NextResponse.json(campeoes.map(mapCampeao));
  } catch (error) {
    console.error("GET /api/campeoes failed", error);
    return NextResponse.json({ error: "failed to fetch champions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "invalid payload" }, { status: 400 });
    }

    const { rachaId, nome, categoria, data, descricao, jogadores, imagem } = body as Record<
      string,
      unknown
    >;

    if (typeof rachaId !== "string" || rachaId.trim().length === 0) {
      return NextResponse.json({ error: "rachaId is required" }, { status: 400 });
    }
    if (typeof nome !== "string" || nome.trim().length < 3) {
      return NextResponse.json({ error: "nome must have at least 3 characters" }, { status: 400 });
    }
    if (typeof categoria !== "string" || categoria.trim().length === 0) {
      return NextResponse.json({ error: "categoria is required" }, { status: 400 });
    }
    if (typeof data !== "string" || data.trim().length === 0) {
      return NextResponse.json({ error: "data is required" }, { status: 400 });
    }

    const parsedDate = new Date(data);
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "invalid date" }, { status: 400 });
    }

    const sanitizedJogadores = sanitizeJogadores(jogadores);

    const created = await prisma.campeao.create({
      data: {
        rachaId: rachaId.trim(),
        nome: nome.trim(),
        categoria: categoria.trim(),
        data: parsedDate,
        descricao: typeof descricao === "string" ? descricao.trim() : null,
        jogadores: sanitizedJogadores.length ? JSON.stringify(sanitizedJogadores) : null,
        imagem: typeof imagem === "string" ? imagem.trim() : null,
      },
    });

    return NextResponse.json(mapCampeao(created), { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("POST /api/campeoes failed", error);
    return NextResponse.json({ error: "failed to create champion" }, { status: 500 });
  }
}
