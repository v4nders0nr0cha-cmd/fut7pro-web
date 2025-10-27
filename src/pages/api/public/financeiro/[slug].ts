// src/pages/api/public/financeiro/[slug].ts

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { slug } = req.query;
  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "Slug é obrigatório" });
  }

  try {
    // Primeiro, verificar se o racha existe e se o financeiro está visível
    const racha = await prisma.racha.findUnique({
      where: {
        slug: slug,
        ativo: true,
      },
      select: {
        id: true,
        financeiroVisivel: true,
      },
    });

    if (!racha) {
      return res.status(404).json({ error: "Racha não encontrado" });
    }

    if (!racha.financeiroVisivel) {
      return res.status(403).json({ error: "Prestação de contas não está visível" });
    }

    // Buscar lançamentos financeiros
    const lancamentos = await prisma.financeiro.findMany({
      where: { rachaId: racha.id },
      select: {
        id: true,
        tipo: true,
        categoria: true,
        valor: true,
        descricao: true,
        data: true,
        criadoEm: true,
        admin: {
          select: {
            nome: true,
            email: true,
          },
        },
      },
      orderBy: { data: "desc" },
    });

    // Calcular resumo financeiro
    const receitas = lancamentos.filter((l) => l.tipo === "receita");
    const despesas = lancamentos.filter((l) => l.tipo === "despesa");

    const totalReceitas = receitas.reduce((sum, l) => sum + l.valor, 0);
    const totalDespesas = despesas.reduce((sum, l) => sum + l.valor, 0);
    const saldo = totalReceitas - totalDespesas;

    const resumo = {
      totalReceitas,
      totalDespesas,
      saldo,
      totalLancamentos: lancamentos.length,
    };

    return res.status(200).json({
      resumo,
      lancamentos: lancamentos.map((l) => ({
        id: l.id,
        tipo: l.tipo,
        categoria: l.categoria,
        valor: l.valor,
        descricao: l.descricao,
        data: l.data,
        criadoEm: l.criadoEm,
        adminNome: l.admin?.nome || "",
        adminEmail: l.admin?.email || "",
      })),
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.log("Erro ao buscar dados financeiros:", error);
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
