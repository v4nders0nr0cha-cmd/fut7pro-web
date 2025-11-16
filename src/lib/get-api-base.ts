const PROD_API_BASE = "https://api.fut7pro.com.br";

function normalizeBase(value: string | undefined) {
  return value ? value.replace(/\/+$/, "") : undefined;
}

export function getApiBase() {
  const rawBase =
    typeof window === "undefined"
      ? (process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL)
      : process.env.NEXT_PUBLIC_API_URL;

  let base = normalizeBase(rawBase);

  if (!base) {
    if (process.env.NODE_ENV === "production") {
      return PROD_API_BASE;
    }
    throw new Error("NEXT_PUBLIC_API_URL nao esta configurada.");
  }

  if (process.env.NODE_ENV === "production") {
    try {
      const hostname = new URL(base).hostname;
      if (!/fut7pro\.com\.br$/i.test(hostname)) {
        if (typeof window === "undefined") {
          console.warn(
            `[Fut7Pro] Base de API (${base}) não aponta para o domínio oficial; forçando ${PROD_API_BASE} em produção.`
          );
        }
        return PROD_API_BASE;
      }
    } catch {
      if (typeof window === "undefined") {
        console.warn(
          `[Fut7Pro] Base de API inválida (${base}); usando ${PROD_API_BASE} em produção.`
        );
      }
      return PROD_API_BASE;
    }
  }

  return base;
}
