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

const BASE_PATH = "/api/admin/rachas/agenda";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteParams = { params: { id?: string } };

export async function DELETE(req: NextRequest, context: RouteParams) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const id = context.params.id;
  if (!id) {
    return jsonResponse({ error: "Id invalido" }, { status: 400 });
  }

  const headers = buildHeaders(user, tenantSlug, { includeContentType: false });
  const targetUrl = `${getApiBase()}${BASE_PATH}/${encodeURIComponent(id)}`;
  const { response, body } = await proxyBackend(targetUrl, {
    method: "DELETE",
    headers,
  });

  return forwardResponse(response.status, body);
}
