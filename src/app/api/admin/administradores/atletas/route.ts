import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  appendSafeQueryParams,
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../../../_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const headers = buildHeaders(user, tenantSlug, { includeContentType: false });
  const targetUrl = new URL(`${getApiBase()}/admin/administradores/atletas`);
  appendSafeQueryParams(req.nextUrl.searchParams, targetUrl);

  const { response, body } = await proxyBackend(targetUrl.toString(), {
    method: "GET",
    headers,
    cache: "no-store",
  });

  return forwardResponse(response.status, body);
}
