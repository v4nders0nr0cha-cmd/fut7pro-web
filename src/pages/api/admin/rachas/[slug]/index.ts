// src/pages/api/admin/rachas/[slug]/index.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;
  if (!slug || typeof slug !== "string")
    return res.status(400).json({ error: "Slug é obrigatório" });

  // GET - Detalhes do racha
  if (req.method === "GET") {
    const racha = await prisma.racha.findUnique({
      where: { slug: slug },
    });
    if (!racha) return res.status(404).json({ error: "Racha não encontrado" });
    return res.status(200).json(racha);
  }

  // PATCH - Atualizar campos do racha (inclusive financeiroVisivel)
  if (req.method === "PATCH" || req.method === "PUT") {
    const { nome, descricao, logoUrl, tema, regras, ativo, financeiroVisivel } = req.body;
    const updateData: Record<string, unknown> = {};
    if (nome !== undefined) updateData.nome = nome;
    if (descricao !== undefined) updateData.descricao = descricao;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (tema !== undefined) updateData.tema = tema;
    if (regras !== undefined) updateData.regras = regras;
    if (ativo !== undefined) updateData.ativo = ativo;
    if (financeiroVisivel !== undefined) updateData.financeiroVisivel = financeiroVisivel;

    const updated = await prisma.racha.update({
      where: { slug: slug },
      data: updateData,
    });
    return res.status(200).json(updated);
  }

  res.setHeader("Allow", ["GET", "PATCH", "PUT"]);
  return res.status(405).json({ error: "Método não permitido" });
}
