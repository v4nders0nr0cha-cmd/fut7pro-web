import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { timeId } = req.query;

  if (!timeId) return res.status(400).json({ error: "timeId é obrigatório" });

  if (req.method === "PUT") {
    const { nome, slug, escudoUrl, corPrincipal, corSecundaria, jogadores } =
      req.body;
    const updated = await prisma.time.update({
      where: { id: String(timeId) },
      data: {
        nome,
        slug,
        escudoUrl,
        corPrincipal,
        corSecundaria,
        jogadores: jogadores ? JSON.stringify(jogadores) : undefined,
      },
    });
    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    await prisma.time.delete({
      where: { id: String(timeId) },
    });
    return res.status(204).end();
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  res.status(405).json({ error: "Método não permitido" });
}
