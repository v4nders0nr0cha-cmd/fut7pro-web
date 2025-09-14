// Endpoint de fallback que tenta SSL fix primeiro, depois mock
export const runtime = "nodejs";
// Cache de 1 minuto na CDN
export const revalidate = 60;

import { diagHeaders } from "@/lib/api-headers";

export async function HEAD() {
  // Sem bater no backend: reporte o modo esperado/atual
  // Por enquanto, assume mock (quando SSL estiver OK, mudará para ssl-fix)
  const headers = diagHeaders("mock");
  return new Response(null, {
    status: 200,
    headers,
  });
}

export async function GET() {
  // Dados estáticos de fallback (sem chamadas internas para evitar problemas de cache)
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
    headers: diagHeaders("static"),
  });
}
