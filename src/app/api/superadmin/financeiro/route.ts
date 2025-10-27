import { NextResponse } from "next/server";
import { loadSuperadminFinanceiro } from "@/server/superadmin/financeiro";

const isProd = process.env.NODE_ENV === "production";
const isWebDirectDbDisabled =
  process.env.DISABLE_WEB_DIRECT_DB === "true" || process.env.DISABLE_WEB_DIRECT_DB === "1";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    if (isProd && isWebDirectDbDisabled) {
      return NextResponse.json(
        { error: "web_db_disabled: use a API do backend para financeiro (superadmin)" },
        { status: 501 }
      );
    }
    const data = await loadSuperadminFinanceiro();
    const response = NextResponse.json(data);
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch (error) {
    console.error("[superadmin-financeiro]", error);
    const message =
      error instanceof Error && error.message.includes("WEB_DB_DISABLED")
        ? "web_db_disabled: use a API do backend"
        : "Erro ao carregar financeiro";
    const status = message.startsWith("web_db_disabled") ? 501 : 500;
    const response = NextResponse.json({ error: message }, { status });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  }
}
