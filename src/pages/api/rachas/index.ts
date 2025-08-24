// src/pages/api/rachas/index.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession({ req });
  if (!session) return res.status(401).json({ error: "Não autenticado" });

  const userId = session.user.id as string;
  const userEmail = session.user.email ?? ""; // Garante string nunca null

  if (req.method === "GET") {
    // Lista todos os rachas em que o usuário é owner, admin ou está como jogador (multi-tenant SaaS)
    const rachas = await prisma.racha.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { admins: { some: { usuarioId: userId } } },
          { jogadores: { some: { jogador: { email: userEmail } } } }, // Garante string no filtro
        ],
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
        ownerId: true,
        criadoEm: true,
        atualizadoEm: true,
        ativo: true,
      },
      orderBy: { criadoEm: "desc" },
    });
    return res.json(rachas);
  }

  if (req.method === "POST") {
    const { nome, slug, descricao, logoUrl, tema, regras } = req.body;
    const novoRacha = await prisma.racha.create({
      data: {
        nome,
        slug,
        descricao,
        logoUrl,
        tema,
        regras,
        ownerId: userId,
        ativo: true,
      },
    });
    return res.status(201).json(novoRacha);
  }

  return res.status(405).json({ error: "Método não permitido" });
}
