// Função utilitária para padronizar headers de diagnóstico/cache
export const CACHE_DYNAMIC = "no-store, max-age=0, must-revalidate";
export const CACHE_FALLBACK =
  "public, max-age=0, must-revalidate, s-maxage=60, stale-while-revalidate=300";

export function diagHeaders(source: "backend" | "mock" | "static") {
  return {
    "Cache-Control": source === "backend" ? CACHE_DYNAMIC : CACHE_FALLBACK,
    "x-fallback-source": source,
  };
}
