import { NextResponse } from "next/server";
import { jsonResponse, requireSuperAdminUser } from "../../_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NOT_IMPLEMENTED_PAYLOAD = {
  error: "Exportacao financeira via API ainda nao disponivel",
  code: "FEATURE_NOT_AVAILABLE",
};

export async function GET() {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  return NextResponse.json(NOT_IMPLEMENTED_PAYLOAD, {
    status: 501,
    headers: {
      "Cache-Control": "no-store, max-age=0, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
