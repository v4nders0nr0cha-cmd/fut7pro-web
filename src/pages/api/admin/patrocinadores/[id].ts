// src/pages/api/admin/patrocinadores/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/options";
import { prisma } from "@/server/prisma";

export const config = { api: { runtime: "nodejs" } };

const isProd = process.env.NODE_ENV === "production";
const isWebDirectDbDisabled =
  process.env.DISABLE_WEB_DIRECT_DB === "true" || process.env.DISABLE_WEB_DIRECT_DB === "1";

async function canAccess(userId: string | undefined, rachaId: string) {
  if (!userId) return false;
  const asOwner = await prisma.racha.findFirst({
    where: { id: rachaId, ownerId: userId },
    select: { id: true },
  });
  if (asOwner) return true;
  const asAdmin = await prisma.rachaAdmin.findFirst({
    where: { rachaId, usuarioId: userId },
    select: { rachaId: true },
  });
  return Boolean(asAdmin);
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

  const { id } = req.query;
  if (!id || typeof id !== "string") return res.status(400).json({ error: "ID inválido" });

  const current = await prisma.patrocinador.findUnique({ where: { id } });
  if (!current) return res.status(404).json({ error: "Patrocinador não encontrado" });

  const allowed = await canAccess((session.user as any)?.id as string | undefined, current.rachaId);
  if (!allowed) return res.status(403).json({ error: "Sem permissão" });

  if (req.method === "GET") {
    return res.status(200).json(current);
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    const { nome, logo, link, prioridade, status, descricao } = (req.body ?? {}) as Partial<{
      nome: string;
      logo: string;
      link?: string;
      prioridade?: number;
      status?: string;
      descricao?: string | null;
    }>;

    const updated = await prisma.patrocinador.update({
      where: { id },
      data: {
        ...(nome !== undefined ? { nome: String(nome).trim() } : {}),
        ...(logo !== undefined ? { logo: String(logo).trim() } : {}),
        ...(link !== undefined ? { link: String(link).trim() } : {}),
        ...(prioridade !== undefined ? { prioridade: Number(prioridade) } : {}),
        ...(status !== undefined ? { status: String(status).toLowerCase() } : {}),
        ...(descricao !== undefined ? { descricao } : {}),
      },
    });
    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    await prisma.patrocinador.delete({ where: { id } });
    return res.status(204).end();
  }

  res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
  return res.status(405).json({ error: `Método ${req.method} não permitido` });
}
