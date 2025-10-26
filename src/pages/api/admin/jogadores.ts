// src/pages/api/admin/jogadores.ts

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

const isProd = process.env.NODE_ENV === "production";
const isWebDirectDbDisabled =
  process.env.DISABLE_WEB_DIRECT_DB === "true" || process.env.DISABLE_WEB_DIRECT_DB === "1";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (isProd && isWebDirectDbDisabled) {
    return res
      .status(501)
      .json({ error: "web_db_disabled: use API backend para admin/jogadores" });
  }
  // Headers para evitar cache e problemas de prerender
  res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  // Checagem de permissão (pode evoluir para validar admin)
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  switch (req.method) {
    case "GET": {
      try {
        const jogadores = await prisma.jogador.findMany();
        // Sempre retorna array (até se vazio)
        return res.status(200).json(Array.isArray(jogadores) ? jogadores : []);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Erro desconhecido";
        return res.status(500).json({ error: "Erro ao buscar jogadores", details: errorMessage });
      }
    }
    case "POST": {
      const { nome, apelido, email, foto, status, mensalista, posicao, rachaId } = req.body;
      try {
        const jogador = await prisma.jogador.create({
          data: { nome, apelido, email, foto, status, mensalista, posicao, rachaId },
        });
        return res.status(201).json(jogador);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Erro desconhecido";
        return res.status(400).json({ error: "Erro ao criar jogador", details: errorMessage });
      }
    }
    case "PUT": {
      const { id, ...data } = req.body;
      try {
        const jogador = await prisma.jogador.update({
          where: { id },
          data,
        });
        return res.status(200).json(jogador);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Erro desconhecido";
        return res.status(400).json({ error: "Erro ao atualizar jogador", details: errorMessage });
      }
    }
    case "DELETE": {
      const { id } = req.body;
      try {
        await prisma.jogador.delete({
          where: { id },
        });
        return res.status(204).end();
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Erro desconhecido";
        return res.status(400).json({ error: "Erro ao excluir jogador", details: errorMessage });
      }
    }
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      return res.status(405).end(`Método ${req.method} não permitido`);
  }
}
