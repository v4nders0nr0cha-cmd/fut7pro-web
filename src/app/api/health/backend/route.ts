// Healthcheck do backend para validar conectividade
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

  // Testar diferentes endpoints de healthcheck
  const healthEndpoints = ["/health", "/status", "/api/health", "/api/status", "/"];

  for (const endpoint of healthEndpoints) {
    const url = `${base}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: "HEAD",
        headers: { accept: "application/json" },
        // Timeout de 5 segundos
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        return new Response(
          JSON.stringify({
            status: "ok",
            backend: base,
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
      // Continuar para o proximo endpoint
      console.log(`Healthcheck failed for ${url}:`, error.message);
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
