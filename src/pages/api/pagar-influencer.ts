import type { NextApiRequest, NextApiResponse } from "next";

// Configurar runtime para Node.js (necessário para Prisma)
export const config = {
  api: {
    runtime: "nodejs",
  },
};
import { getServerSession } from "next-auth/next";
import { authOptions, type AuthSession } from "@/server/auth/options";
import { PRISMA_DISABLED_MESSAGE, isDirectDbBlocked, prisma } from "@/server/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Headers para evitar cache e problemas de prerender
  res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (req.method !== "POST") return res.status(405).end();

  if (isDirectDbBlocked) {
    return res.status(501).json({ error: PRISMA_DISABLED_MESSAGE });
  }

  const session = (await getServerSession(req, res, authOptions)) as AuthSession | null;

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
