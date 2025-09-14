// Endpoint de fallback - modelo minimalista para cache CDN
export const runtime = "nodejs";
export const revalidate = 60; // habilita ISR na Vercel

const CACHE = "s-maxage=60, stale-while-revalidate=300";
const baseHeaders = {
  "Content-Type": "application/json",
  // Vercel respeita CDN-Cache-Control mesmo com Cache-Control dinâmico
  "CDN-Cache-Control": CACHE,
  "Cache-Control": "public, max-age=0, must-revalidate",
};

const DATA = [
  {
    id: "fallback-1",
    timeA: "Time A",
    timeB: "Time B",
    golsTimeA: 0,
    golsTimeB: 0,
    finalizada: false,
    data: new Date().toISOString(),
    _fallback: true,
  },
];

// GET: sempre com headers corretos e diagnóstico
export async function GET() {
  // Tentar domínio Railway primeiro (SSL válido)
  const railwayUrl = process.env.RAILWAY_BACKEND_URL || "https://fut7pro-backend.up.railway.app";
  const path = (process.env.JOGOS_DIA_PATH || "/partidas/jogos-do-dia").replace(/^\/?/, "/");

  try {
    const response = await fetch(`${railwayUrl}${path}`, {
      headers: { accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...baseHeaders, "x-fallback-source": "railway" },
      });
    }
  } catch (e) {
    console.log("Railway backend failed, using static data:", e?.message);
  }

  // Fallback para dados estáticos
  return new Response(JSON.stringify(DATA), {
    status: 200,
    headers: { ...baseHeaders, "x-fallback-source": "static" },
  });
}

// HEAD: precisa setar Cache-Control explicitamente
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: baseHeaders,
  });
}
