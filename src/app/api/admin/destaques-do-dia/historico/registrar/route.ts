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

  const payload = await req.json().catch(() => null);
  if (!payload) {
    return jsonResponse({ error: "Payload invalido" }, { status: 400 });
  }

  const targetUrl = `${getApiBase()}/api/admin/destaques-do-dia/historico/registrar`;
  const { response, body } = await proxyBackend(targetUrl, {
    method: "POST",
    headers: buildHeaders(user, tenantSlug, { includeContentType: true }),
    body: JSON.stringify(payload),
  });

  return forwardResponse(response.status, body);
}
