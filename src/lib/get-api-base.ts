const DEFAULT_API_BASE = "https://api.fut7pro.com.br";

export function getApiBase() {
  const baseUrl =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    process.env.RAILWAY_BACKEND_URL ||
    DEFAULT_API_BASE;

  // evita barras duplicadas e garante retorno consistente
  const normalized = baseUrl.trim().replace(/\/+$/, "");
  return normalized || DEFAULT_API_BASE;
}
