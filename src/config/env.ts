// Configuração de variáveis de ambiente
export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "https://api.fut7pro.com.br",

  // Mercado Pago
  mpPublicKey: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || "",

  // Tenant ID (em produção, viria do contexto de autenticação)
  demoTenantId: process.env.NEXT_PUBLIC_DEMO_TENANT_ID || "demo-tenant",

  // Environment
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
};

export default config;
