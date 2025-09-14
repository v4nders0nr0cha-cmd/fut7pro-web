// Endpoint de fallback que tenta SSL fix primeiro, depois mock
export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // Força função dinâmica (evita PRERENDER)

const cacheHeaders = {
  "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
};

export async function HEAD() {
  return new Response(null, { status: 200, headers: cacheHeaders });
}

export async function GET() {
  // Tentar SSL fix primeiro
  try {
    const sslFixUrl = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://app.fut7pro.com.br"}/api/public/jogos-do-dia-ssl-fix`;
    const response = await fetch(sslFixUrl, {
      headers: { accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      return Response.json(data, {
        status: 200,
        headers: {
          ...cacheHeaders,
          "x-fallback-source": "ssl-fix",
        },
      });
    }
  } catch (e) {
    console.log("SSL fix failed, trying mock:", e?.message);
  }

  // Fallback para mock
  try {
    const mockUrl = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://app.fut7pro.com.br"}/api/public/jogos-do-dia-mock`;
    const response = await fetch(mockUrl, {
      headers: { accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (response.ok) {
      const data = await response.json();
      return Response.json(data, {
        status: 200,
        headers: {
          ...cacheHeaders,
          "x-fallback-source": "mock",
        },
      });
    }
  } catch (e) {
    console.error("Mock fallback failed:", e?.message);
  }

  // Último recurso: dados estáticos
  const fallbackData = [
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

  return Response.json(fallbackData, {
    status: 200,
    headers: {
      ...cacheHeaders,
      "x-fallback-source": "static",
    },
  });
}
