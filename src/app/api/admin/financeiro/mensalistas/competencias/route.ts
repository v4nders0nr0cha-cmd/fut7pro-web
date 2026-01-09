import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../../../../_proxy/helpers";

const BASE_PATH = "/financeiro/mensalistas/competencias";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(user);
  const targetUrl = new URL(`${getApiBase()}${BASE_PATH}`);
  req.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const { response, body } = await proxyBackend(targetUrl.toString(), {
    method: "GET",
    cache: "no-store",
    headers: buildHeaders(user, tenantSlug, { includeContentType: false }),
  });

  return forwardResponse(response.status, body);
}
