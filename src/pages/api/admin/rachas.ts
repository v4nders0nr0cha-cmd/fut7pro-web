// src/pages/api/admin/rachas.ts

import type { NextApiRequest, NextApiResponse } from "next";

// Configurar runtime para Node.js (necessário para Prisma)
export const config = {
  api: {
    runtime: "nodejs",
  },
};
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/options";
import { prisma } from "@/server/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Headers para evitar cache e problemas de prerender
  res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  switch (req.method) {
    case "GET": {
      try {
        const rachas = await prisma.racha.findMany({
          where: { ativo: true },
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
            // Para admins e jogadores, ajuste se quiser trazer objetos completos:
            // admins: { select: { id: true, usuarioId: true } },
            // jogadores: { select: { id: true, jogadorId: true } },
          },
          orderBy: { criadoEm: "desc" },
        });
        return res.status(200).json(Array.isArray(rachas) ? rachas : []);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Erro desconhecido";
        return res.status(500).json({ error: "Erro ao buscar rachas", details: errorMessage });
      }
    }
    case "POST": {
      const { nome, slug, descricao, logoUrl, tema, regras } = req.body;
      try {
        const racha = await prisma.racha.create({
          data: {
            nome,
            slug,
            descricao,
            logoUrl,
            tema,
            regras,
            ativo: false, // 👈 nasce inativo por padrão
            status: "INATIVO",
            ownerId: session.user.id,
          },
        });
        return res.status(201).json(racha);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Erro desconhecido";
        return res.status(400).json({ error: "Erro ao criar racha", details: errorMessage });
      }
    }
    case "PUT": {
      const { id, nome, slug, descricao, logoUrl, tema, regras } = req.body;
      try {
        const racha = await prisma.racha.update({
          where: { id },
          data: {
            nome,
            slug,
            descricao,
            logoUrl,
            tema,
            regras,
          },
        });
        return res.status(200).json(racha);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Erro desconhecido";
        return res.status(400).json({ error: "Erro ao atualizar racha", details: errorMessage });
      }
    }
    case "DELETE": {
      const { id } = req.body;
      try {
        await prisma.racha.update({
          where: { id },
          data: { ativo: false },
        });
        return res.status(204).end();
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Erro desconhecido";
        return res.status(400).json({ error: "Erro ao excluir racha", details: errorMessage });
      }
    }
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      return res.status(405).end(`Método ${req.method} não permitido`);
  }
}
