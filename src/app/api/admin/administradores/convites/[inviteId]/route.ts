import { NextRequest } from "next/server";
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

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ inviteId: string }> }
) {
  const user = await requireUser();
  if (!user) return jsonResponse({ error: "Nao autenticado" }, { status: 401 });

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });

  const { inviteId } = await context.params;
  if (!inviteId) return jsonResponse({ error: "Convite invalido" }, { status: 400 });

  const { response, body } = await proxyBackend(
    `${getApiBase()}/admin/administradores/convites/${encodeURIComponent(inviteId)}`,
    { method: "DELETE", headers: buildHeaders(user, tenantSlug), cache: "no-store" }
  );
  return forwardResponse(response.status, body);
}
