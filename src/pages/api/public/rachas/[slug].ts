// src/pages/api/public/rachas/[slug].ts

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { slug } = req.query;
  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "Slug é obrigatório" });
  }

  try {
    const racha = await prisma.racha.findUnique({
      where: {
        slug: slug,
        ativo: true,
      },
      select: {
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
      },
    });

    if (!racha) {
      return res.status(404).json({ error: "Racha não encontrado" });
    }

    return res.status(200).json({
      ...racha,
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
