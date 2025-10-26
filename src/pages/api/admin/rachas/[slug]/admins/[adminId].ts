import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/prisma"; // ajuste o path conforme seu projeto
const isProd = process.env.NODE_ENV === "production";
const isWebDirectDbDisabled =
  process.env.DISABLE_WEB_DIRECT_DB === "true" || process.env.DISABLE_WEB_DIRECT_DB === "1";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (isProd && isWebDirectDbDisabled) {
    return res.status(501).json({ error: "web_db_disabled: admin/admins endpoint desabilitado em prod" });
  }
  const { adminId } = req.query;

  if (!adminId) return res.status(400).json({ error: "adminId é obrigatório" });

  if (req.method === "PUT") {
    const { role, status } = req.body;
    if (!role && !status)
      return res.status(400).json({ error: "Envie role ou status para atualizar" });

    const updated = await prisma.rachaAdmin.update({
      where: { id: String(adminId) },
      data: { ...(role && { role }), ...(status && { status }) },
    });

    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    await prisma.rachaAdmin.delete({
      where: { id: String(adminId) },
    });
    return res.status(204).end();
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  res.status(405).json({ error: "Método não permitido" });
}
