// src/pages/api/auth/recover/request.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/prisma";
const isProd = process.env.NODE_ENV === "production";
const isWebDirectDbDisabled =
  process.env.DISABLE_WEB_DIRECT_DB === "true" || process.env.DISABLE_WEB_DIRECT_DB === "1";
import crypto from "crypto";

export const config = { api: { bodyParser: true } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (isProd && isWebDirectDbDisabled) {
    return res.status(501).json({ error: "web_db_disabled: use API backend para auth/recover/request" });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Método ${req.method} não permitido` });
  }
  const email = String((req.body?.email as string | undefined) ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) return res.status(400).json({ error: "E-mail inválido" });

  const user = await prisma.usuario.findUnique({ where: { email }, select: { id: true } });
  // Não expor existência do usuário
  if (!user) return res.status(200).json({ ok: true });

  // Gera token e expiração (1h)
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({ data: { token, userId: user.id, expiresAt } });

  // Em produção enviar e-mail. Em dev, loga o link no console do server
  // eslint-disable-next-line no-console
  console.info(`[recover] Reset link: /admin/recuperar?token=${token}`);

  return res.status(200).json({ ok: true });
}
