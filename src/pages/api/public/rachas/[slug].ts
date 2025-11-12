// src/pages/api/public/rachas/[slug].ts

import type { NextApiRequest, NextApiResponse } from "next";
import { PRISMA_DISABLED_MESSAGE, isDirectDbBlocked, prisma } from "@/server/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  if (isDirectDbBlocked) {
    return res.status(501).json({ error: PRISMA_DISABLED_MESSAGE });
  }

  const { slug } = req.query;
  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "Identificador é obrigatório" });
  }

  try {
    const cleaned = slug.trim();

    const select = {
      id: true,
      nome: true,
      slug: true,
      descricao: true,
      logoUrl: true,
      tema: true,
      regras: true,
      ativo: true,
      financeiroVisivel: true,
      criadoEm: true,
      atualizadoEm: true,
      ownerId: true,
    };

    const rachaPorSlug = await prisma.racha.findFirst({
      where: {
        OR: [{ slug: cleaned }, { id: cleaned }],
        ativo: true,
      },
      select,
    });

    if (!rachaPorSlug) {
      return res.status(404).json({ error: "Racha não encontrado" });
    }

    return res.status(200).json({
      ...rachaPorSlug,
      admins: [],
      jogadores: [],
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.log("Erro ao buscar racha:", error);
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
