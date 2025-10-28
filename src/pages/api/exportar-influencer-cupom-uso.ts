import { Parser } from "json2csv";
import type { NextApiRequest, NextApiResponse } from "next";
import { PRISMA_DISABLED_MESSAGE, isDirectDbBlocked, prisma } from "@/server/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (isDirectDbBlocked) {
    return res.status(501).json({ error: PRISMA_DISABLED_MESSAGE });
  }

  const usos = await prisma.influencerCupomUso.findMany({
    include: {
      influencer: true,
      usuario: true,
      racha: true,
    },
    orderBy: { dataCadastro: "desc" },
  });

  const data = usos.map((u) => ({
    influencer: u.influencer.nome,
    cupom: u.influencer.cupom,
    presidente: u.usuario.nome,
    email: u.usuario.email,
    racha: u.racha.nome,
    status: u.status,
    data: u.dataCadastro.toISOString().slice(0, 10),
  }));

  const parser = new Parser();
  const csv = parser.parse(data);

  res.setHeader("Content-Disposition", "attachment; filename=usos_cupom.csv");
  res.setHeader("Content-Type", "text/csv");
  res.status(200).send(csv);
}
