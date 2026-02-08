import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "@/app/api/_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteParams = { params: { id?: string } };

export async function POST(_req: Request, context: RouteParams) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const requestId = context.params.id;
  if (!requestId) {
    return jsonResponse({ error: "Solicitacao invalida" }, { status: 400 });
  }

  const targetUrl = `${getApiBase()}/admin/mensalistas/requests/${encodeURIComponent(requestId)}/reject`;
  const { response, body } = await proxyBackend(targetUrl, {
    method: "POST",
    headers: buildHeaders(user, tenantSlug, { includeContentType: false }),
  });

  return forwardResponse(response.status, body);
}
