import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireSuperAdminUser,
} from "../../../_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const body = await req.text();
  const targetUrl = `${getApiBase()}/superadmin/notificacoes/preview`;

  const { response, body: backendBody } = await proxyBackend(targetUrl, {
    method: "POST",
    headers: buildHeaders(user, undefined, { includeContentType: true }),
    body,
  });

  return forwardResponse(response.status, backendBody);
}
