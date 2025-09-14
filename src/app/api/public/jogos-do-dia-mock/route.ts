// Endpoint mock temporário para testar o proxy
export const runtime = "nodejs";

const cacheHeaders = {
  "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
};

export async function HEAD() {
  return new Response(null, { status: 200, headers: cacheHeaders });
}

export async function GET() {
  // Dados mock para testar o proxy
  const mockData = [
    {
      id: "1",
      timeA: "Time A",
      timeB: "Time B",
      golsTimeA: 2,
      golsTimeB: 1,
      finalizada: true,
    },
    {
      id: "2",
      timeA: "Time C",
      timeB: "Time D",
      golsTimeA: 0,
      golsTimeB: 0,
      finalizada: false,
    },
  ];

  return new Response(JSON.stringify(mockData), {
    status: 200,
    headers: {
      ...cacheHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
