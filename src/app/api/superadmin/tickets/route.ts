import { NextResponse } from "next/server";
import { loadSuperadminTickets } from "@/server/superadmin/tickets";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await loadSuperadminTickets();
    const response = NextResponse.json(data);
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch (error) {
    console.error("[superadmin-tickets]", error);
    const response = NextResponse.json({ error: "Erro ao carregar tickets" }, { status: 500 });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  }
}
