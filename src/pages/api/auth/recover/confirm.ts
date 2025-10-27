// src/pages/api/auth/recover/confirm.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/prisma";
const isProd = process.env.NODE_ENV === "production";
const isWebDirectDbDisabled =
  process.env.DISABLE_WEB_DIRECT_DB === "true" || process.env.DISABLE_WEB_DIRECT_DB === "1";
import bcrypt from "bcryptjs";

export const config = { api: { bodyParser: true } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (isProd && isWebDirectDbDisabled) {
    return res.status(501).json({ error: "web_db_disabled: use API backend para auth/recover/confirm" });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Método ${req.method} não permitido` });
  }

  const token = String((req.body?.token as string | undefined) ?? "").trim();
  const password = String((req.body?.password as string | undefined) ?? "").trim();
  if (!token) return res.status(400).json({ error: "Token inválido" });
  if (password.length < 8) return res.status(400).json({ error: "Senha deve ter pelo menos 8 caracteres" });

  const rec = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!rec || rec.expiresAt < new Date()) {
    return res.status(400).json({ error: "Token expirado ou inválido" });
  }

  const senhaHash = await bcrypt.hash(password, 10);
  await prisma.usuario.update({ where: { id: rec.userId }, data: { senhaHash } });
  await prisma.passwordResetToken.delete({ where: { token } });

  return res.status(200).json({ ok: true });
}
