import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Caminho correto conforme seu projeto

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) return res.status(401).json({ error: "Not authorized" });

  const { influencerId, valor, observacao } = req.body;
  if (!influencerId || !valor)
    return res.status(400).json({ error: "Dados obrigatórios faltando" });

  try {
    await prisma.influencerPagamento.create({
      data: {
        influencerId,
        valor: parseFloat(valor),
        observacao: observacao || null,
        adminId: session.user.id,
      },
    });
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao registrar pagamento" });
  }
}
