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

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const slugParam = req.nextUrl.searchParams.get("slug") || undefined;
  const tenantSlug = resolveTenantSlug(user, slugParam);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const id = context.params.id;
  if (!id) {
    return jsonResponse({ error: "ID invalido" }, { status: 400 });
  }

  const { response, body } = await proxyBackend(`${getApiBase()}/admin/notifications/${id}/read`, {
    method: "PATCH",
    headers: buildHeaders(user, tenantSlug),
  });

  return forwardResponse(response.status, body);
}
