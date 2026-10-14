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

export async function DELETE(_req: Request, context: { params: Promise<{ requestId: string }> }) {
  const user = await requireUser();
  if (!user) return jsonResponse({ error: "Nao autenticado" }, { status: 401 });

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }
  const { requestId } = await context.params;
  if (!requestId) return jsonResponse({ error: "Solicitacao invalida" }, { status: 400 });

  const headers = buildHeaders(user, tenantSlug);
  const { response, body } = await proxyBackend(
    `${getApiBase()}/admin/administradores/transferir-propriedade/${encodeURIComponent(requestId)}`,
    { method: "DELETE", headers, cache: "no-store" }
  );
  return forwardResponse(response.status, body);
}
