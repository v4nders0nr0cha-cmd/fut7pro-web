// 1) Mude para Node.js runtime (evita TLS chato do Edge)
export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // Força função dinâmica (evita PRERENDER)
// Opcional: foque a região mais próxima do seu backend
export const preferredRegion = "gru1";

// 2) Cache para CDN
const cacheHeaders = {
  "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
};

// 3) HEAD não chama upstream (evita 5xx desnecessário)
export async function HEAD() {
  return new Response(null, { status: 200, headers: cacheHeaders });
}

export async function GET() {
  const base = process.env.BACKEND_URL?.replace(/\/+$/, "");
  const path = (process.env.JOGOS_DIA_PATH || "/partidas/jogos-do-dia").replace(/^\/?/, "/");
  if (!base) {
    // Loga e devolve falha "limpa"
    console.error("BACKEND_URL ausente");
    return new Response("missing BACKEND_URL", {
      status: 500,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const upstream = `${base}${path}`;

  try {
    const r = await fetch(upstream, {
      headers: { accept: "application/json" },
      // revalidate só opera no App Router com Node runtime
      next: { revalidate: 60 },
    });

    if (!r.ok) {
      const body = await r.text().catch(() => "");
      console.error("Upstream non-OK", r.status, body.slice(0, 300));
      // pode repassar o status do upstream se preferir
      return new Response("upstream_error", {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const data = await r.text(); // evita parse duplo; mantém content-type se precisar
    return new Response(data, {
      status: 200,
      headers: {
        ...cacheHeaders,
        "Content-Type": r.headers.get("content-type") ?? "application/json; charset=utf-8",
      },
    });
  } catch (err: any) {
    console.error("proxy jogos-do-dia fetch failed", { message: err?.message, cause: err?.cause });
    return new Response("proxy_fetch_failed", {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
