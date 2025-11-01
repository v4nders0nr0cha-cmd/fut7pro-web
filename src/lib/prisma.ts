// src/lib/prisma.ts
//
// Compatibilidade: evite acessar o banco diretamente pelo web.
// Utilize as APIs do backend Nest. Este arquivo apenas reexporta
// os utilitarios de protecao definidos em src/server/prisma.ts.
export { PRISMA_DISABLED_MESSAGE, isDirectDbBlocked, prisma } from "@/server/prisma";
