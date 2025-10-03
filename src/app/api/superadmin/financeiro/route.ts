import { NextResponse } from "next/server";
import { loadSuperadminFinanceiro } from "@/server/superadmin/financeiro";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await loadSuperadminFinanceiro();
    const response = NextResponse.json(data);
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch (error) {
    console.error("[superadmin-financeiro]", error);
    const response = NextResponse.json({ error: "Erro ao carregar financeiro" }, { status: 500 });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  }
}
