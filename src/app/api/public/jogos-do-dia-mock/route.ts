// Endpoint mock temporário para testar o proxy
export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // Força função dinâmica (evita PRERENDER)

import { diagHeaders } from "@/lib/api-headers";

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: diagHeaders("mock"),
  });
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

  return Response.json(mockData, {
    status: 200,
    headers: diagHeaders("mock"),
  });
}
