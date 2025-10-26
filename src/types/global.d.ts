// Tipos globais para resolver problemas de tipos externos
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
declare module "@/lib/api" {
  export const apiClient: any;
  export const partidasApi: any;
  export const jogadoresApi: any;
  export const tenantDataApi: any;
  export const estrelasApi: any;
  export const sorteioApi: any;
  export const financeiroApi: any;
  export const estatisticasApi: any;
  export const superAdminApi: any;
  export const rachaApi: any;
  export const tenantApi: any;
}
