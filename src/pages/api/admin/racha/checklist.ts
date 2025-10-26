// src/pages/api/admin/racha/checklist.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getPublishChecklist } from "@/server/services/publishChecklist";
import { prisma } from "@/server/prisma";

type Item = { key: string; ok: boolean; help?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV === "production" &&
      (process.env.DISABLE_WEB_DIRECT_DB === "true" || process.env.DISABLE_WEB_DIRECT_DB === "1")) {
    return res.status(501).json({ error: "web_db_disabled: use API backend para checklist" });
  }
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Método não permitido" });
  }

  // Não cachear respostas deste endpoint
  res.setHeader("Cache-Control", "no-store");

  // rachaId pode vir como array no Pages Router
  const q = req.query.rachaId;
  const rid = Array.isArray(q) ? q[0] : q;
  const rachaId = typeof rid === "string" ? rid.trim() : "";

  // Harden: recusar strings "undefined"/"null" e vazios
  if (!rachaId || rachaId === "undefined" || rachaId === "null") {
    return res.status(400).json({ error: "rachaId obrigatório" });
  }

  try {
    // Caminho feliz: usar o serviço oficial
    const { items, allOk, racha } = await getPublishChecklist(rachaId);
    return res.status(200).json({ items, allOk, racha });
  } catch (e: any) {
    // Mapeia "não encontrado" explicitamente quando possível (Prisma)
    const code = e?.code ?? e?.name;
    if (code === "P2025") {
      return res.status(404).json({ error: "Racha não encontrado", rachaId });
    }

    // Fallback defensivo: não retornar 500 à toa — devolve um checklist mínimo (HTTP 200)
    try {
      const racha = await prisma.racha.findUnique({
        where: { id: rachaId },
        select: { id: true, slug: true, ativo: true },
      });

      if (!racha) {
        return res.status(404).json({ error: "Racha não encontrado", rachaId });
      }

      const items: Item[] = [];

      // Validação simples de slug para dar feedback útil mesmo no fallback
      const slugOk = !!racha.slug && /^[a-z0-9-]{3,}$/.test(racha.slug);
      items.push({
        key: "slug_valido",
        ok: slugOk,
        help: slugOk ? undefined : "Use letras minúsculas, números e hífen (mín. 3 caracteres).",
      });

      // Item que sinaliza a falha do serviço completo
      items.push({
        key: "service_error",
        ok: false,
        help: "Falha ao calcular o checklist completo. Consulte os logs do servidor.",
      });

      const allOk = items.every((i) => i.ok);

      if (process.env.NODE_ENV !== "production") {
        console.error({
          evt: "checklist_fallback",
          rachaId,
          error: String(e?.message ?? e),
        });
      }

      return res.status(200).json({ items, allOk, racha });
    } catch (inner: any) {
      if (process.env.NODE_ENV !== "production") {
        console.error({
          evt: "checklist_double_fail",
          rachaId,
          error: String(inner?.message ?? inner),
          rootError: String(e?.message ?? e),
        });
      }
      return res.status(500).json({ error: "Erro interno" });
    }
  }
}
