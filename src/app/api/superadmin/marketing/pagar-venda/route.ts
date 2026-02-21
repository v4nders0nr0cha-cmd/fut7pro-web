import { NextResponse } from "next/server";
import { jsonResponse, requireSuperAdminUser } from "../../../_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const GONE_PAYLOAD = {
  error: "Endpoint legado desativado",
  code: "LEGACY_ENDPOINT_DISABLED",
};

export async function POST() {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  return NextResponse.json(GONE_PAYLOAD, {
    status: 410,
    headers: {
      "Cache-Control": "no-store, max-age=0, must-revalidate",
    },
  });
}
