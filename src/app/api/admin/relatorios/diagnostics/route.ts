import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
} from "../../../_proxy/helpers";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) return jsonResponse({ error: "Nao autenticado" }, { status: 401 });

  const search = req.nextUrl.search || "";
  const { response, body } = await proxyBackend(
    `${getApiBase()}/admin/relatorios/diagnostics${search}`,
    {
      headers: buildHeaders(user, user.tenantSlug || user.tenantId),
      cache: "no-store",
    }
  );

  return forwardResponse(response.status, body);
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) return jsonResponse({ error: "Nao autenticado" }, { status: 401 });

  const payload = await req.json().catch(() => ({}));
  const search = req.nextUrl.search || "";
  const { response, body } = await proxyBackend(
    `${getApiBase()}/admin/relatorios/diagnostics${search}`,
    {
      method: "POST",
      headers: {
        ...buildHeaders(user, user.tenantSlug || user.tenantId, { includeContentType: true }),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    }
  );

  return forwardResponse(response.status, body);
}
