import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/prisma";
const isProd = process.env.NODE_ENV === "production";
const isWebDirectDbDisabled =
  process.env.DISABLE_WEB_DIRECT_DB === "true" || process.env.DISABLE_WEB_DIRECT_DB === "1";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (isProd && isWebDirectDbDisabled) {
    return res
      .status(501)
      .json({ error: "web_db_disabled: use a API do backend para times/admin" });
  }
  const { slug } = req.query;

  if (!slug) return res.status(400).json({ error: "Slug é obrigatório" });

  // Primeiro, buscar o racha pelo slug
  const racha = await prisma.racha.findUnique({
    where: { slug: String(slug) },
    select: { id: true },
  });

  if (!racha) return res.status(404).json({ error: "Racha não encontrado" });

  if (req.method === "GET") {
    const times = await prisma.time.findMany({
      where: { rachaId: racha.id },
      orderBy: { nome: "asc" },
    });
    return res.status(200).json(times);
  }

  if (req.method === "POST") {
    const { nome, slug: timeSlug, escudoUrl, corPrincipal, corSecundaria, jogadores } = req.body;
    if (!nome || !timeSlug) return res.status(400).json({ error: "Nome e slug são obrigatórios" });

    const novo = await prisma.time.create({
      data: {
        nome,
        slug: timeSlug,
        escudoUrl,
        corPrincipal,
        corSecundaria,
        rachaId: racha.id,
        jogadores: jogadores ? JSON.stringify(jogadores) : undefined,
      },
    });
    return res.status(201).json(novo);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: "Método não permitido" });
}
