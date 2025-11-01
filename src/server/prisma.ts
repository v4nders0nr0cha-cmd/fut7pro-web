import { PrismaClient } from "@prisma/client";

export const PRISMA_DISABLED_MESSAGE =
  "[Fut7Pro] Direct database access via Prisma is disabled in this environment. Use the backend API (api.fut7pro.com.br) instead or unset DISABLE_WEB_DIRECT_DB.";

const shouldDisablePrisma =
  process.env.NODE_ENV === "production" &&
  (process.env.DISABLE_WEB_DIRECT_DB ?? "").toLowerCase() === "true";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createBlockedPrismaProxy(): PrismaClient {
  return new Proxy({} as PrismaClient, {
    get() {
      throw new Error(PRISMA_DISABLED_MESSAGE);
    },
  });
}

export const isDirectDbBlocked = shouldDisablePrisma;
export const prisma = shouldDisablePrisma
  ? createBlockedPrismaProxy()
  : (globalForPrisma.prisma ?? new PrismaClient());

if (!shouldDisablePrisma && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
