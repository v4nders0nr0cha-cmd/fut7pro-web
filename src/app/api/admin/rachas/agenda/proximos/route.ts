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
} from "../../../../_proxy/helpers";

const BASE_PATH = "/api/admin/rachas/agenda/proximos";

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
  const targetUrl = new URL(`${getApiBase()}${BASE_PATH}`);
  appendSafeQueryParams(req.nextUrl.searchParams, targetUrl);

  const { response, body } = await proxyBackend(targetUrl.toString(), {
    method: "GET",
    cache: "no-store",
    headers,
  });

  return forwardResponse(response.status, body);
}
