import type { NextApiRequest, NextApiResponse } from "next";
const isProd = process.env.NODE_ENV === "production";
const isWebDirectDbDisabled =
  process.env.DISABLE_WEB_DIRECT_DB === "true" || process.env.DISABLE_WEB_DIRECT_DB === "1";
import { getServerSession } from "next-auth/next";

import { prisma } from "@/server/prisma";
import { authOptions } from "@/server/auth/options";
import { withAdminApiRoute } from "@/server/auth/guards";

function pickStr(x: unknown): string {
  if (typeof x === "string") return x;
  if (Array.isArray(x)) return String(x[0] ?? "");
  return "";
}

async function publishHandler(req: NextApiRequest, res: NextApiResponse) {
  if (isProd && isWebDirectDbDisabled) {
    return res
      .status(501)
      .json({ error: "web_db_disabled: endpoint admin dev-only em produção" });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Metodo nao permitido" });
  }

  res.setHeader("Cache-Control", "no-store");

  const rachaId = pickStr(req.body?.rachaId ?? req.query?.rachaId).trim();
  if (!rachaId) {
    return res.status(400).json({ error: "rachaId obrigatorio" });
  }

  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Nao autenticado" });
  }

  const racha = await prisma.racha.findUnique({
    where: { id: rachaId },
    select: {
      id: true,
      slug: true,
      ativo: true,
      status: true,
      ownerId: true,
      admins: { select: { usuarioId: true } },
    },
  });

  if (!racha) {
    return res.status(404).json({ error: "Racha nao encontrado" });
  }

  const isOwner = racha.ownerId === userId;
  const isAdmin = racha.admins.some((admin) => admin.usuarioId === userId);
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: "Sem permissao para publicar este racha" });
  }

  if (racha.ativo) {
    return res.status(200).json({
      ok: true,
      racha: {
        id: racha.id,
        slug: racha.slug,
        ativo: racha.ativo,
        status: racha.status,
      },
    });
  }

  try {
    const updated = await prisma.racha.update({
      where: { id: rachaId },
      data: {
        ativo: true,
        status: "ATIVO" as any,
      },
      select: {
        id: true,
        slug: true,
        ativo: true,
        status: true,
      },
    });

    return res.status(200).json({ ok: true, racha: updated });
  } catch (error) {
    console.error("POST /api/admin/racha/publish failed", error);
    return res.status(500).json({ error: "Erro interno" });
  }
}

const wrapped = withAdminApiRoute(publishHandler);
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (isProd && isWebDirectDbDisabled) {
    return res
      .status(501)
      .json({ error: "web_db_disabled: endpoint admin dev-only em produção" });
  }
  return wrapped(req, res);
}

