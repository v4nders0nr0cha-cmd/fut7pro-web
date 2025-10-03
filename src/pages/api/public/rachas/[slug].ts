// src/pages/api/public/rachas/[slug].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Método não permitido" });
  }

  // Corrige extração do slug (array vs string) para evitar casos como "=1"
  const raw = req.query.slug;
  const slug = Array.isArray(raw) ? raw[0] : raw;
  if (!slug || typeof slug !== "string" || !slug.trim()) {
    return res.status(400).json({ error: "Slug é obrigatório" });
  }

  // Preview só em dev com ?dev=1
  const allowDevPreview = process.env.NODE_ENV !== "production" && req.query.dev === "1";

  try {
    // Usa findUnique por slug e filtra visibilidade depois
    const racha = await prisma.racha.findUnique({
      where: { slug },
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
      return res.status(404).json({ error: "Racha não encontrado", slug });
    }

    // Em produção (ou sem ?dev=1 em dev), racha precisa estar ativo
    if (!allowDevPreview && !racha.ativo) {
      return res.status(404).json({ error: "Racha inativo", slug });
    }

    // Campos públicos (admins/jogadores mockados por enquanto)
    return res.status(200).json({ ...racha, admins: [], jogadores: [] });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error({ evt: "public_racha_error", slug, error: String(error) });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
