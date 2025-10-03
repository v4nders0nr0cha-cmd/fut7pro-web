// src/server/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // Reaproveita a instância em hot-reload do Next (apenas em dev)
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const isProd = process.env.NODE_ENV === "production";
const shouldLogQueries = process.env.PRISMA_LOG_QUERIES === "1";

function prismaClientFactory() {
  return new PrismaClient({
    log: shouldLogQueries
      ? (["query", "info", "warn", "error"] as const)
      : isProd
        ? (["error"] as const)
        : (["warn", "error"] as const),
    errorFormat: isProd ? "minimal" : "pretty",
    // Se precisar forçar URL: datasources: { db: { url: process.env.DATABASE_URL } },
  });
}

// Singleton seguro entre reloads em dev
export const prisma = global.prisma ?? prismaClientFactory();
if (!isProd) global.prisma = prisma;

// Logger de queries lentas (opcional)
if (shouldLogQueries) {
  prisma.$on("query", (e) => {
    const slowMs = Number(process.env.PRISMA_SLOW_MS ?? 200);
    const dur = typeof e.duration === "number" ? e.duration : Number(e.duration);
    if (dur >= slowMs) {
      // eslint-disable-next-line no-console
      console.log(`[prisma][slow ${dur}ms] ${e.query} :: ${e.params}`);
    }
  });
}

/**
 * Suporte a JSON.stringify para BigInt em respostas de API
 * Evita "Do not know how to serialize a BigInt"
 * Sem usar `any` nem regras do @typescript-eslint.
 */
const bigIntProto = BigInt.prototype as unknown as {
  toJSON?: () => string;
};
if (!bigIntProto.toJSON) {
  Object.defineProperty(BigInt.prototype, "toJSON", {
    value() {
      return this.toString();
    },
    configurable: true,
    enumerable: false,
    writable: true,
  });
}
