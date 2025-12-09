// Healthcheck do backend para validar conectividade (com timeouts curtos para não travar build)
export const runtime = "nodejs";

export async function GET() {
  const base = process.env.BACKEND_URL?.replace(/\/+$/, "");
  if (!base) {
    return new Response(
      JSON.stringify({
        status: "error",
        message: "BACKEND_URL not configured",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Endpoints enxutos para evitar loop longo em build
  const healthEndpoints = ["/health", "/api/health"];

  // Testar domínio principal e fallback Railway, se existir
  const railwayUrl = process.env.RAILWAY_BACKEND_URL || "https://fut7pro-backend.up.railway.app";
  const testUrls = [
    { base, endpoints: healthEndpoints },
    { base: railwayUrl, endpoints: healthEndpoints },
  ];

  // Em ambiente Vercel (build/edge) tempo menor; local um pouco maior
  const timeoutMs = process.env.VERCEL ? 1500 : 4000;

  for (const { base: testBase, endpoints } of testUrls) {
    for (const endpoint of endpoints) {
      try {
        const url = `${testBase}${endpoint}`;
        const response = await fetch(url, {
          method: "HEAD",
          headers: { accept: "application/json" },
          signal: AbortSignal.timeout(timeoutMs),
        });

        if (response.ok) {
          return new Response(
            JSON.stringify({
              status: "ok",
              backend: testBase,
              endpoint,
              statusCode: response.status,
              timestamp: new Date().toISOString(),
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      } catch (error: any) {
        // Continua para o próximo endpoint sem travar
        console.log(`Healthcheck failed for ${testBase}${endpoint}:`, error.message);
      }
    }
  }

  return new Response(
    JSON.stringify({
      status: "error",
      message: "Backend not responding",
      backend: base,
      testedEndpoints: healthEndpoints,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 502,
      headers: { "Content-Type": "application/json" },
    }
  );
}
