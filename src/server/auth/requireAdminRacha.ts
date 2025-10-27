import { getServerSession } from "next-auth";
import type { NextApiRequest, NextApiResponse } from "next";

import { authOptions } from "@/server/auth/options";
import { prisma } from "@/server/prisma";
import type { AdminRole } from "./roles";
import { normalizeAdminRole } from "./roles";

export type AdminContext = {
  userId: string;
  rachaId: string;
  slug: string;
  role: AdminRole;
};

/**
 * Guard para rotas admin que requerem permissao sobre um racha especifico.
 * Valida sessao e verifica se usuario e owner ou admin do racha.
 *
 * @throws Error com "UNAUTHENTICATED" ou "FORBIDDEN"
 */
export async function requireAdminRacha(
  req: NextApiRequest,
  res: NextApiResponse,
  rachaIdParam?: string
): Promise<AdminContext> {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.id) {
    res.status(401).json({ error: "Nao autenticado" });
    throw new Error("UNAUTHENTICATED");
  }

  const userId = session.user.id as string;
  const sessionRole = normalizeAdminRole(session.user.role);

  let targetRachaId = rachaIdParam;

  if (!targetRachaId) {
    const firstRacha = await prisma.racha.findFirst({
      where: {
        OR: [{ ownerId: userId }, { admins: { some: { usuarioId: userId, status: "ativo" } } }],
      },
      select: { id: true },
    });

    if (firstRacha) {
      targetRachaId = firstRacha.id;
    }
  }

  if (!targetRachaId) {
    res.status(403).json({ error: "Sem permissao neste racha" });
    throw new Error("FORBIDDEN");
  }

  const racha = await prisma.racha.findFirst({
    where: {
      id: targetRachaId,
      OR: [{ ownerId: userId }, { admins: { some: { usuarioId: userId, status: "ativo" } } }],
    },
    select: {
      id: true,
      slug: true,
      ownerId: true,
      admins: {
        where: { usuarioId: userId },
        select: { role: true },
        take: 1,
      },
    },
  });

  if (!racha) {
    res.status(403).json({ error: "Sem permissao neste racha" });
    throw new Error("FORBIDDEN");
  }

  const isOwner = racha.ownerId === userId;
  const relationRole = normalizeAdminRole(racha.admins[0]?.role as string | undefined);
  const fallbackRole = relationRole ?? sessionRole ?? null;
  const canonicalRole: AdminRole | null = isOwner ? "PRESIDENTE" : fallbackRole;
  const role: AdminRole = canonicalRole ?? "ADMIN";

  return {
    userId,
    rachaId: racha.id,
    slug: racha.slug,
    role,
  };
}

/**
 * Valida se usuario tem permissao especifica (ex: apenas PRESIDENTE pode publicar)
 */
export function requireRole(ctx: AdminContext, allowedRoles: AdminRole[]): boolean {
  return allowedRoles.includes(ctx.role);
}
