// src/server/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // Reaproveita a instância em hot-reload do Next (apenas em dev)
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const isProd = process.env.NODE_ENV === "production";
const isWebDirectDbDisabled =
  process.env.DISABLE_WEB_DIRECT_DB === "true" || process.env.DISABLE_WEB_DIRECT_DB === "1";
const shouldLogQueries = process.env.PRISMA_LOG_QUERIES === "1";

function prismaClientFactory() {
  if (isProd && isWebDirectDbDisabled) {
    // Bloqueia acesso direto ao DB no web em produção, conforme especificação.
    const message =
      "[WEB_DB_DISABLED] Acesso direto ao banco está desabilitado no web em produção. Utilize a API do backend.";
    // Proxy que lança erro em qualquer acesso a propriedades/métodos
    return new Proxy({}, {
      get() {
        throw new Error(message);
      },
      apply() {
        throw new Error(message);
      },
    }) as unknown as PrismaClient;
  }
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
