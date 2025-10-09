// Configuracao de variaveis de ambiente
export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "https://api.fut7pro.com.br",
  appUrl: (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(/\/+$/, ""),

  // Mercado Pago
  mpPublicKey: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || "",

  // Tenant ID (em producao, viria do contexto de autenticacao)
  demoTenantId: process.env.NEXT_PUBLIC_DEMO_TENANT_ID || "demo-tenant",

  // Monitoring / Analytics
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  analyticsUrl: process.env.NEXT_PUBLIC_ANALYTICS_URL || "",

  // Assets / Uploads
  maxFileSize: Number(process.env.MAX_FILE_SIZE || 5_242_880),
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/webp")
    .split(",")
    .map((type) => type.trim())
    .filter(Boolean),

  // Meta
  siteName: process.env.SITE_NAME || "Fut7Pro",
  googleSiteVerification: process.env.GOOGLE_SITE_VERIFICATION || "",

  // Environment flags
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
};

export default config;
