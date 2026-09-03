import { getApiBase } from "@/lib/get-api-base";
import {
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

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const targetUrl = `${getApiBase()}/api/admin/destaques-do-dia/rodadas`;
  const { response, body } = await proxyBackend(targetUrl, {
    method: "GET",
    cache: "no-store",
    headers: buildHeaders(user, tenantSlug, { includeContentType: false }),
  });

  return forwardResponse(response.status, body);
}
