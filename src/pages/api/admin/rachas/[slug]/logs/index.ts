import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
// import { getSession } from "next-auth/react"; // Adapte se quiser autenticação

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
    // O método correto é prisma.adminLog (tudo minúsculo)
    const logs = await prisma.adminLog.findMany({
      where: { rachaId: racha.id },
      include: { admin: true },
      orderBy: { criadoEm: "desc" },
      take: 50, // Limita para não estourar
    });
    return res.status(200).json(
      logs.map((log) => ({
        id: log.id,
        adminId: log.adminId,
        adminNome: log.admin?.nome || "",
        adminEmail: log.admin?.email || "",
        acao: log.acao,
        detalhes: log.detalhes,
        criadoEm: log.criadoEm,
      }))
    );
  }

  if (req.method === "POST") {
    const { adminId, acao, detalhes } = req.body;
    if (!adminId || !acao)
      return res.status(400).json({ error: "Campos obrigatórios não enviados" });

    // O método correto é prisma.adminLog
    const novo = await prisma.adminLog.create({
      data: {
        rachaId: racha.id,
        adminId,
        acao,
        detalhes,
      },
    });
    return res.status(201).json(novo);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: "Método não permitido" });
}
