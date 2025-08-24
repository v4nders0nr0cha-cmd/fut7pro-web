// src/lib/prisma.ts

// Frontend não deve acessar banco diretamente. Este módulo é mantido apenas para compatibilidade em desenvolvimento.
// Em produção, `prisma` será undefined para desencorajar o uso.
// Ajuste as rotas de API do Next para delegarem ao backend em produção.
import { PrismaClient } from "@prisma/client";

const isProd = process.env.NODE_ENV === "production";

let instance: PrismaClient | undefined;
if (!isProd) {
  const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
  instance =
    globalForPrisma.prisma ?? new PrismaClient({ log: ["error", "warn"] });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = instance;
}

export const prisma: any = instance as any;
