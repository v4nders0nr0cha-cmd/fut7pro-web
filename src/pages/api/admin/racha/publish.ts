import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/server/prisma";

function pickStr(x: unknown): string {
  if (typeof x === "string") return x;
  if (Array.isArray(x)) return String(x[0] ?? "");
  return "";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apenas POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método não permitido" });
  }

  // não cachear (boa prática em endpoints mutadores)
  res.setHeader("Cache-Control", "no-store");

  // rachaId pode vir no body (JSON) ou via query
  const rachaId = pickStr(req.body?.rachaId ?? req.query?.rachaId).trim();
  if (!rachaId) return res.status(400).json({ error: "rachaId obrigatório" });

  // Bypass para E2E/dev (sem sessão)
  const bypass = process.env.E2E_ALLOW_NOAUTH === "1";

  // Se você quiser exigir sessão quando NÃO for bypass,
  // devolvemos 401 de forma explícita. (Integração
  // com NextAuth pode ser plugada aqui no futuro.)
  if (!bypass) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  try {
    // Verifica existência (e já traz slug para resposta)
    const exists = await prisma.racha.findUnique({
      where: { id: rachaId },
      select: { id: true, slug: true, ativo: true, status: true },
    });
    if (!exists) return res.status(404).json({ error: "Racha não encontrado" });

    // Idempotente: se já está ativo, apenas confirma.
    if (exists.ativo === true) {
      return res.status(200).json({ ok: true, racha: exists, bypass: true });
    }

    // Atualiza para ativo
    const racha = await prisma.racha.update({
      where: { id: rachaId },
      data: {
        ativo: true,
        // use o enum do Prisma se existir (ex.: RachaStatus.ATIVO).
        // mantemos 'as any' para não travar o build se o enum variar.
        status: "ATIVO" as any,
      },
      select: { id: true, slug: true, ativo: true, status: true },
    });

    // Log administrativo — pule quando bypass estiver ativo
    // (evita violação de FK por adminId nulo)
    // Quando integrar autenticação, pegue o adminId da sessão e grave.
    if (!bypass) {
      try {
        // const adminId = session.user.id;
        // await prisma.adminLog.create({ data: { action: "publish", rachaId, adminId } });
      } catch (e) {
        // Mantemos apenas aviso para não prejudicar o fluxo principal
        console.warn("adminLog.publish falhou (aviso):", e);
      }
    }

    return res.status(200).json({ ok: true, racha, bypass: true });
  } catch (e) {
    console.error("POST /api/admin/racha/publish failed", e);
    return res.status(500).json({ error: "Erro interno" });
  }
}
