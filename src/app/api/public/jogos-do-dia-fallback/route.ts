import { CACHE_FALLBACK, diagHeaders } from "@/lib/api-headers";
import { JOGOS_DO_DIA_FALLBACK } from "@/lib/jogos-do-dia-data";

// Endpoint de fallback - modelo minimalista para cache CDN
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

const baseHeaders = {
  "Content-Type": "application/json",
  "CDN-Cache-Control": CACHE_FALLBACK,
};

// GET: sempre com headers corretos e diagnostico
export async function GET() {
  return new Response(JSON.stringify(JOGOS_DO_DIA_FALLBACK), {
    status: 200,
    headers: { ...baseHeaders, ...diagHeaders("static") },
  });
}

// HEAD: precisa setar Cache-Control explicitamente
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: { ...baseHeaders, ...diagHeaders("static") },
  });
}
