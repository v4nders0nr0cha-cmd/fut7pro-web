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

export async function GET(req: NextRequest) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const headers = buildHeaders(user);
  delete headers["x-tenant-id"];
  delete headers["x-tenant-slug"];

  const params = req.nextUrl.searchParams.toString();
  const targetUrl = `${getApiBase()}/superadmin/compensacoes-acesso/historico${params ? `?${params}` : ""}`;
  const { response, body } = await proxyBackend(targetUrl, {
    headers,
    cache: "no-store",
  });

  return forwardResponse(response.status, body);
}
