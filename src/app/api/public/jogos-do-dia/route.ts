import { CACHE_FALLBACK, diagHeaders } from "@/lib/api-headers";
import { JOGOS_DO_DIA_FALLBACK } from "@/lib/jogos-do-dia-data";
import { getApiBase } from "@/lib/get-api-base";

// 1) Mude para Node.js runtime (evita TLS chato do Edge)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
// Opcional: foque a regiao mais proxima do seu backend
export const preferredRegion = "gru1";

const JSON_CT = "application/json; charset=utf-8";

function buildStaticResponse(message: string, context?: unknown) {
  if (context) {
    console.warn(message, context);
  } else {
    console.warn(message);
  }
  return new Response(JSON.stringify(JOGOS_DO_DIA_FALLBACK), {
    status: 200,
    headers: {
      ...diagHeaders("static"),
      "Content-Type": JSON_CT,
      "CDN-Cache-Control": CACHE_FALLBACK,
    },
  });
}

// 3) HEAD nao chama upstream (evita 5xx desnecessario)
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: diagHeaders("backend"),
  });
}

export async function GET() {
  let base: string;
  try {
    base = getApiBase();
  } catch (error: any) {
    return buildStaticResponse("API base ausente", {
      message: error?.message ?? "NEXT_PUBLIC_API_URL ausente",
    });
  }

  const path = (process.env.JOGOS_DIA_PATH || "/partidas/jogos-do-dia").replace(/^\/?/, "/");
  const upstream = `${base}${path}`;

  try {
    const r = await fetch(upstream, {
      cache: "no-store",
      headers: { accept: "application/json" },
    });

    if (!r.ok) {
      const body = await r.text().catch(() => "");
      return buildStaticResponse("Upstream non-OK", {
        status: r.status,
        body: body.slice(0, 300),
      });
    }

    const data = await r.text(); // evita parse duplo; mantem content-type se precisar
    return new Response(data, {
      status: 200,
      headers: {
        ...diagHeaders("backend"),
        "Content-Type": r.headers.get("content-type") ?? JSON_CT,
      },
    });
  } catch (err: any) {
    return buildStaticResponse("proxy jogos-do-dia fetch failed", {
      message: err?.message,
      cause: err?.cause,
    });
  }
}
