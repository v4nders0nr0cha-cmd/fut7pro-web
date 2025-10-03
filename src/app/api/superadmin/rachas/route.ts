import { NextResponse } from "next/server";
import { loadSuperadminRachas } from "@/server/superadmin/rachas";

export const runtime = "nodejs";

export async function GET() {
  try {
    const itens = await loadSuperadminRachas();
    const response = NextResponse.json({ itens });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch (error) {
    console.error("[superadmin-rachas]", error);
    const response = NextResponse.json({ error: "Erro ao listar rachas" }, { status: 500 });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  }
}
