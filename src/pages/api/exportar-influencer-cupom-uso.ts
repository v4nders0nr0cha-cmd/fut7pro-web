import { prisma } from "@/server/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { Parser } from "json2csv";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

