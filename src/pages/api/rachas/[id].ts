// src/pages/api/rachas/[id].ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) return res.status(401).json({ error: "Não autenticado" });

  const userId = session.user.id as string;
  const { id } = req.query;

  const racha = await prisma.racha.findUnique({
    where: { id: String(id) },
    include: { admins: true, jogadores: true },
  });
  if (!racha) return res.status(404).json({ error: "Racha não encontrado" });

  // Permissão: só owner ou admin pode editar/excluir
  const isOwner = racha.ownerId === userId;
  // Ajuste para campo correto do admin, conforme schema: usuarioId
  const isAdmin = racha.admins.some((a) => a.usuarioId === userId);

  if (req.method === "GET") {
    if (!(isOwner || isAdmin)) return res.status(403).json({ error: "Sem permissão" });
    return res.json(racha);
  }

  if (req.method === "PUT") {
    if (!(isOwner || isAdmin)) return res.status(403).json({ error: "Sem permissão" });
    const { nome, slug, descricao, logoUrl, tema, regras, ativo } = req.body;
    const rachaAtualizado = await prisma.racha.update({
      where: { id: String(id) },
      data: { nome, slug, descricao, logoUrl, tema, regras, ativo },
    });
    return res.json(rachaAtualizado);
  }

  if (req.method === "DELETE") {
    if (!isOwner) return res.status(403).json({ error: "Só owner pode deletar" });
    // Soft delete
    await prisma.racha.update({
      where: { id: String(id) },
      data: { ativo: false },
    });
    return res.status(204).end();
  }

  return res.status(405).json({ error: "Método não permitido" });
}
