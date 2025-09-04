// src/pages/api/admin/partidas.ts

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

// Utilitário para garantir que apenas admin/owner pode editar o racha
async function canEditRacha(rachaId: string, userId: string) {
  const racha = await prisma.racha.findUnique({
    where: { id: rachaId },
    include: { admins: true },
  });
  if (!racha) return false;
  if (racha.ownerId === userId) return true;
  return racha.admins.some((a) => a.usuarioId === userId);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Headers para evitar cache e problemas de prerender
  res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  const userId = session.user.id as string;

  // Pega rachaId por body ou query
  const rachaId = (req.method === "GET" ? req.query.rachaId : req.body.rachaId) || undefined;

  if (!rachaId || typeof rachaId !== "string") {
    return res.status(400).json({ error: "rachaId é obrigatório" });
  }

  // Verifica permissão de edição/criação
  if (["POST", "PUT", "DELETE"].includes(req.method || "")) {
    const pode = await canEditRacha(rachaId, userId);
    if (!pode) {
      return res.status(403).json({ error: "Sem permissão no racha" });
    }
  }

  switch (req.method) {
    case "GET": {
      const partidas = await prisma.partida.findMany({
        where: { rachaId },
        orderBy: { data: "desc" },
      });
      return res.status(200).json(partidas);
    }
    case "POST": {
      const {
        data,
        horario,
        local,
        timeA,
        timeB,
        golsTimeA,
        golsTimeB,
        jogadoresA,
        jogadoresB,
        destaquesA,
        destaquesB,
        finalizada,
      } = req.body;
      const novaPartida = await prisma.partida.create({
        data: {
          rachaId,
          data,
          horario,
          local,
          timeA,
          timeB,
          golsTimeA,
          golsTimeB,
          jogadoresA,
          jogadoresB,
          destaquesA,
          destaquesB,
          finalizada: finalizada ?? false,
        },
      });
      return res.status(201).json(novaPartida);
    }
    case "PUT": {
      const {
        id,
        data: dataP,
        horario,
        local,
        timeA,
        timeB,
        golsTimeA,
        golsTimeB,
        jogadoresA,
        jogadoresB,
        destaquesA,
        destaquesB,
        finalizada,
      } = req.body;
      if (!id) return res.status(400).json({ error: "id da partida é obrigatório" });
      const partidaAtualizada = await prisma.partida.update({
        where: { id },
        data: {
          data: dataP,
          horario,
          local,
          timeA,
          timeB,
          golsTimeA,
          golsTimeB,
          jogadoresA,
          jogadoresB,
          destaquesA,
          destaquesB,
          finalizada,
        },
      });
      return res.status(200).json(partidaAtualizada);
    }
    case "DELETE": {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: "id da partida é obrigatório" });
      await prisma.partida.delete({ where: { id } });
      return res.status(204).end();
    }
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      return res.status(405).end(`Método ${req.method} não permitido`);
  }
}
