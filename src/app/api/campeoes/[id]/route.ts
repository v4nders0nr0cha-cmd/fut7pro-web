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
        if (
          item &&
          typeof item === "object" &&
          "nome" in item &&
          typeof (item as Record<string, unknown>).nome === "string"
        ) {
          return ((item as Record<string, unknown>).nome as string).trim();
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

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const campeao = await prisma.campeao.findUnique({ where: { id } });
    if (!campeao) {
      return NextResponse.json({ error: "champion not found" }, { status: 404 });
    }
    return NextResponse.json(mapCampeao(campeao));
  } catch (error) {
    console.error(`GET /api/campeoes/${id} failed`, error);
    return NextResponse.json({ error: "failed to fetch champion" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "invalid payload" }, { status: 400 });
    }

    const { nome, categoria, data, descricao, jogadores, imagem, rachaId } = body as Record<
      string,
      unknown
    >;

    const updateData: Prisma.CampeaoUpdateInput = {};

    if (typeof rachaId === "string" && rachaId.trim().length > 0) {
      updateData.rachaId = rachaId.trim();
    }
    if (typeof nome === "string" && nome.trim().length >= 3) {
      updateData.nome = nome.trim();
    }
    if (typeof categoria === "string" && categoria.trim().length > 0) {
      updateData.categoria = categoria.trim();
    }
    if (typeof data === "string" && data.trim().length > 0) {
      const parsedDate = new Date(data);
      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: "invalid date" }, { status: 400 });
      }
      updateData.data = parsedDate;
    }
    if (typeof descricao === "string") {
      updateData.descricao = descricao.trim().length ? descricao.trim() : null;
    }
    if (typeof imagem === "string") {
      updateData.imagem = imagem.trim().length ? imagem.trim() : null;
    }
    if (jogadores !== undefined) {
      const sanitized = sanitizeJogadores(jogadores);
      updateData.jogadores = sanitized.length ? JSON.stringify(sanitized) : null;
    }

    const updated = await prisma.campeao.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(mapCampeao(updated));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "champion not found" }, { status: 404 });
    }
    console.error(`PUT /api/campeoes/${id} failed`, error);
    return NextResponse.json({ error: "failed to update champion" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    await prisma.campeao.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "champion not found" }, { status: 404 });
    }
    console.error(`DELETE /api/campeoes/${id} failed`, error);
    return NextResponse.json({ error: "failed to delete champion" }, { status: 500 });
  }
}
