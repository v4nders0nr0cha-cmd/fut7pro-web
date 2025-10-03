import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { prisma } from "@/server/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export type AdminContext = {
  userId: string;
  rachaId: string;
  slug: string;
  role: string;
};

/**
 * Guard para rotas admin que requerem permissão sobre um racha específico.
 * Valida sessão e verifica se usuário é owner ou admin do racha.
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
    res.status(401).json({ error: "Não autenticado" });
    throw new Error("UNAUTHENTICATED");
  }

  const userId = session.user.id as string;

  // Se rachaId veio do body/query, validar contra ele
  // Senão, buscar primeiro racha do usuário
  let targetRachaId = rachaIdParam;

  if (!targetRachaId) {
    // Buscar primeiro racha onde usuário é owner ou admin
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
    res.status(403).json({ error: "Sem permissão neste racha" });
    throw new Error("FORBIDDEN");
  }

  // Validar permissão: ownerId OU relação RachaAdmin ativa
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
    res.status(403).json({ error: "Sem permissão neste racha" });
    throw new Error("FORBIDDEN");
  }

  // Determinar role: owner → PRESIDENTE, ou pegar da relação admin
  const isOwner = racha.ownerId === userId;
  const role = isOwner ? "PRESIDENTE" : (racha.admins[0]?.role ?? "ADMIN");

  return {
    userId,
    rachaId: racha.id,
    slug: racha.slug,
    role,
  };
}

/**
 * Valida se usuário tem permissão específica (ex: apenas PRESIDENTE pode publicar)
 */
export function requireRole(ctx: AdminContext, allowedRoles: string[]): boolean {
  return allowedRoles.includes(ctx.role);
}
