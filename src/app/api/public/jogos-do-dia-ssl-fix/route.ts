// Versão com SSL fix para Railway
export const runtime = "nodejs";

const cacheHeaders = {
  "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
};

export async function HEAD() {
  return new Response(null, { status: 200, headers: cacheHeaders });
}

export async function GET() {
  const base = process.env.BACKEND_URL?.replace(/\/+$/, "");
  const path = (process.env.JOGOS_DIA_PATH || "/partidas/jogos-do-dia").replace(/^\/?/, "/");

  if (!base) {
    return new Response("missing BACKEND_URL", {
      status: 500,
      headers: { "Cache-Control": "no-store" },
    });
  }

  // Usar domínio Railway se disponível
  const railwayUrl = process.env.RAILWAY_BACKEND_URL || "https://fut7pro-backend.up.railway.app";
  const upstream = `${railwayUrl}${path}`;

  try {
    const r = await fetch(upstream, {
      headers: {
        accept: "application/json",
        "User-Agent": "Fut7Pro-Proxy/1.0",
      },
      next: { revalidate: 60 },
    });

    if (!r.ok) {
      console.error("Upstream non-OK", r.status);
      return new Response("upstream_error", {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const data = await r.text();
    return new Response(data, {
      status: 200,
      headers: {
        ...cacheHeaders,
        "Content-Type": r.headers.get("content-type") ?? "application/json; charset=utf-8",
        "x-fallback-source": "backend",
      },
    });
  } catch (e: any) {
    console.error("proxy jogos-do-dia-ssl-fix failed", e?.message);
    return new Response("proxy_fetch_failed", {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
