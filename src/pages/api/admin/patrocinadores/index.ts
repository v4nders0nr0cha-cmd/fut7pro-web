// src/pages/api/admin/patrocinadores/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/options";
import { prisma } from "@/server/prisma";

export const config = { api: { runtime: "nodejs" } };

const isProd = process.env.NODE_ENV === "production";
const isWebDirectDbDisabled =
  process.env.DISABLE_WEB_DIRECT_DB === "true" || process.env.DISABLE_WEB_DIRECT_DB === "1";

async function resolveRachaId(req: NextApiRequest, userId: string | undefined) {
  const qsRachaId = (req.query.rachaId as string | undefined)?.trim();
  if (qsRachaId) return qsRachaId;
  if (!userId) return null;
  // Tenta dono do racha
  const asOwner = await prisma.racha.findFirst({
    where: { ownerId: userId },
    select: { id: true },
  });
  if (asOwner) return asOwner.id;
  // Tenta admin vinculado
  const asAdmin = await prisma.rachaAdmin.findFirst({
    where: { usuarioId: userId },
    select: { rachaId: true },
  });
  return asAdmin?.rachaId ?? null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (isProd && isWebDirectDbDisabled) {
    return res
      .status(501)
      .json({ error: "web_db_disabled: use API backend para admin/patrocinadores" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  const rachaId = await resolveRachaId(req, (session.user as any)?.id as string | undefined);
  if (!rachaId) {
    // Sem racha associado – retorna vazio para o painel
    if (req.method === "GET") return res.status(200).json([]);
    return res.status(400).json({ error: "Racha não encontrado para este admin" });
  }

  if (req.method === "GET") {
    const items = await prisma.patrocinador.findMany({
      where: { rachaId },
      orderBy: [{ prioridade: "desc" }, { atualizadoEm: "desc" }],
    });
    return res.status(200).json(items);
  }

  if (req.method === "POST") {
    const { nome, logo, link, prioridade, status, descricao } = (req.body ?? {}) as Partial<{
      nome: string;
      logo: string;
      link?: string;
      prioridade?: number;
      status?: string;
      descricao?: string;
    }>;

    if (!nome || !logo) {
      return res.status(400).json({ error: "Campos obrigatórios: nome, logo" });
    }

    const created = await prisma.patrocinador.create({
      data: {
        rachaId,
        nome: String(nome).trim(),
        logo: String(logo).trim(),
        link: (link ?? "").trim(),
        prioridade: Number.isFinite(Number(prioridade)) ? Number(prioridade) : 1,
        status: (status ?? "ativo").toString().toLowerCase(),
        descricao: descricao ?? null,
      },
    });
    return res.status(201).json(created);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: `Método ${req.method} não permitido` });
}
