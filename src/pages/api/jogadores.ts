// src/pages/api/jogadores.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/prisma";
const isProd = process.env.NODE_ENV === "production";
const isWebDirectDbDisabled =
  process.env.DISABLE_WEB_DIRECT_DB === "true" || process.env.DISABLE_WEB_DIRECT_DB === "1";

export const config = { api: { runtime: "nodejs" } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (isProd && isWebDirectDbDisabled) {
    return res.status(501).json({ error: "web_db_disabled: use API backend para jogadores" });
  }
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Método ${req.method} não permitido` });
  }
  const rachaId = req.query.rachaId as string | undefined;
  try {
    if (!rachaId) return res.status(200).json([]);
    const links = await prisma.rachaJogador.findMany({
      where: { rachaId },
      select: { jogador: { select: { id: true, nome: true, apelido: true, email: true, posicao: true, status: true, mensalista: true, foto: true } } },
      orderBy: { jogador: { nome: "asc" } },
    });
    const items = links.map((l) => ({
      id: l.jogador.id,
      nome: l.jogador.nome,
      apelido: l.jogador.apelido,
      email: l.jogador.email,
      posicao: l.jogador.posicao,
      status: (l.jogador.status as any) ?? "Ativo",
      mensalista: Boolean(l.jogador.mensalista),
      avatar: l.jogador.foto ?? "/images/Perfil-sem-Foto-Fut7.png",
    }));
    return res.status(200).json(items);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return res.status(500).json({ error: message });
  }
}
