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

type RouteParams = { params: { id?: string } };

export async function PUT(req: Request, context: RouteParams) {
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

  const payload = await req.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return jsonResponse({ error: "Payload invalido" }, { status: 400 });
  }

  const headers = buildHeaders(user, tenantSlug, { includeContentType: true });
  const targetUrl = `${getApiBase()}/admin/solicitacoes/${encodeURIComponent(requestId)}/reject`;

  const { response, body } = await proxyBackend(targetUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });

  return forwardResponse(response.status, body);
}
