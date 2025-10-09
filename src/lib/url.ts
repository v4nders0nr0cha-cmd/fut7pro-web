// src/lib/url.ts
/**
 * Sanitiza callback/redirects para evitar open redirects.
 * Aceita apenas:
 *  - URLs relativas começando com "/"
 *  - Mesma origem do app (informada por baseOrigin ou NEXT_PUBLIC_APP_URL)
 */
export function safeCallbackUrl(
  target?: string | null,
  fallback = "/admin",
  baseOrigin?: string
): string {
  if (!target) return fallback;

  // URLs relativas são aceitas diretamente
  if (target.startsWith("/")) return target;

  // Origem conhecida em SSR ou client
  const origin =
    baseOrigin ||
    (typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/+$/, "") ||
        "https://app.fut7pro.com.br");

  try {
    const u = new URL(target, origin);
    if (u.origin === origin) return u.pathname + u.search + u.hash;
    return fallback;
  } catch {
    return fallback;
  }
}
