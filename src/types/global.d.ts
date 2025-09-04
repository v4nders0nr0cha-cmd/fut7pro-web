// Tipos globais para resolver problemas de tipos externos
declare module "@prisma/client" {
  export const PrismaClient: any;
  export * from "@prisma/client";
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string;
      name?: string;
      image?: string;
    };
  }
}

// Tipos para Jest (se necessário)
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
    }
  }
}
