// Cliente de monitoramento do frontend
// - Inicializa Sentry de forma segura apenas quando:
//   a) existe DSN público; b) usuário deu consentimento; c) em ambiente de browser

export async function initMonitoring(): Promise<void> {
  if (typeof window === "undefined") return;

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  const consent = safeGetLocalStorage("cookie-consent");
  if (consent !== "accepted") return;

  try {
    // Tenta usar @sentry/nextjs se instalado; caso contrário, @sentry/browser
    let Sentry: any;
    try {
      Sentry = (await import("@sentry/nextjs")).default || (await import("@sentry/nextjs"));
    } catch {
      Sentry = (await import("@sentry/browser")).default || (await import("@sentry/browser"));
    }
    if (!Sentry || !Sentry.init) return;
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || "development",
      tracesSampleRate: 0.1,
    });
  } catch {
    // falha silenciosa se lib não instalada
  }
}

export function sendWebVital(metric: { name: string; value: number; id?: string }) {
  if (typeof window === "undefined") return;
  const consent = safeGetLocalStorage("cookie-consent");
  if (consent !== "accepted") return;
  const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_URL;
  if (!endpoint) return;
  try {
    navigator.sendBeacon?.(endpoint, JSON.stringify(metric));
  } catch {
    // ignora
  }
}

function safeGetLocalStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
