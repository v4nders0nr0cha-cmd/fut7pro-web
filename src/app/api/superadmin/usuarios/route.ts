import { NextResponse } from "next/server";
import { loadSuperadminUsuarios } from "@/server/superadmin/usuarios";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await loadSuperadminUsuarios();
    const response = NextResponse.json(data);
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch (error) {
    console.error("[superadmin-usuarios]", error);
    const response = NextResponse.json({ error: "Erro ao listar usuarios" }, { status: 500 });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  }
}
