import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../../_proxy/helpers";

const BASE_PATH = "/api/campeoes/finalizar-temporada";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const payload = await req.json().catch(() => ({}));
  const headers = {
    ...buildHeaders(user, tenantSlug, { includeContentType: true }),
    "Content-Type": "application/json",
  };

  const { response, body } = await proxyBackend(`${getApiBase()}${BASE_PATH}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  return forwardResponse(response.status, body);
}
