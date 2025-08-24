import * as Sentry from "@sentry/nextjs";

// Configuração do Sentry
export function initSentry() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn("Sentry DSN não configurado");
    return;
  }

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 0.1,

    // Configurações de performance
    integrations: [
      new Sentry.BrowserTracing({
        tracePropagationTargets: ["localhost", "fut7pro.com"],
      }),
    ],
  });
}

// Função para setar contexto do usuário
export function setUserContext(userId: string, userType: string) {
  if (typeof window === "undefined") return;

  Sentry.setUser({
    id: userId,
    username: userType,
    email: `${userType}@fut7pro.com`,
  });

  Sentry.setTag("tenant", "default");
  Sentry.setTag("user_type", userType);
}
