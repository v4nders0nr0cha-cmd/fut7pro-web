// Função utilitária para headers de diagnóstico das APIs
export const CC = "s-maxage=60, stale-while-revalidate=300";

export function diagHeaders(source: "backend" | "ssl-fix" | "mock" | "static") {
  return {
    "Cache-Control": CC,
    "x-fallback-source": source,
  };
}
