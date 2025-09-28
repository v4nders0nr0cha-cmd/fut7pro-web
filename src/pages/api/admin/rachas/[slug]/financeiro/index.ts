import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  if (!slug) return res.status(400).json({ error: "Slug é obrigatório" });

  // Primeiro, buscar o racha pelo slug
  const racha = await prisma.racha.findUnique({
    where: { slug: String(slug) },
    select: { id: true },
  });

  if (!racha) return res.status(404).json({ error: "Racha não encontrado" });

  if (req.method === "GET") {
    const lancamentos = await prisma.financeiro.findMany({
      where: { rachaId: racha.id },
      include: { admin: true },
      orderBy: { data: "desc" },
      take: 100,
    });
    return res.status(200).json(
      lancamentos.map((l) => ({
        id: l.id,
        tipo: l.tipo,
        categoria: l.categoria,
        valor: l.valor,
        descricao: l.descricao,
        data: l.data,
        criadoEm: l.criadoEm,
        adminId: l.adminId,
        adminNome: l.admin?.nome ?? "",
        adminEmail: l.admin?.email ?? "",
      }))
    );
  }

  if (req.method === "POST") {
    const { adminId, tipo, categoria, valor, descricao, data } = req.body;
    if (!adminId || !tipo || !categoria || typeof valor !== "number" || !data) {
      return res.status(400).json({ error: "Campos obrigatórios não enviados" });
    }

    const novo = await prisma.financeiro.create({
      data: {
        rachaId: racha.id,
        adminId,
        tipo,
        categoria,
        valor,
        descricao,
        data: new Date(data),
      },
    });
    return res.status(201).json(novo);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: "Método não permitido" });
}

