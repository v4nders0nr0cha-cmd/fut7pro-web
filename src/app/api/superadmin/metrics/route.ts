import { NextResponse } from "next/server";
import { loadSuperadminMetrics } from "@/server/superadmin/dashboard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await loadSuperadminMetrics();
    const response = NextResponse.json(data);
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch (error) {
    console.error("[superadmin-metrics]", error);
    const response = NextResponse.json(
      { error: "Erro ao carregar metricas do superadmin" },
      { status: 500 }
    );
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  }
}
