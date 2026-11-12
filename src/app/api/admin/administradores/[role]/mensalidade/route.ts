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

export async function PUT(req: NextRequest, context: { params: Promise<{ role: string }> }) {
  const user = await requireUser();
  if (!user) return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) return jsonResponse({ error: "Grupo ativo obrigatorio" }, { status: 400 });
  const { role } = await context.params;
  const { response, body } = await proxyBackend(
    `${getApiBase()}/admin/administradores/${encodeURIComponent(role)}/mensalidade`,
    {
      method: "PUT",
      headers: buildHeaders(user, tenantSlug),
      body: await req.text(),
    }
  );
  return forwardResponse(response.status, body);
}
