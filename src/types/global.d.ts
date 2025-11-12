// Global type helpers
declare module "@prisma/client" {
  export const PrismaClient: any;
  export * from "@prisma/client";
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
    }
  }
}
