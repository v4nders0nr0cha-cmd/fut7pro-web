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
export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const id = context.params.id;
  if (!id) {
    return jsonResponse({ error: "Id invalido" }, { status: 400 });
  }

  const searchParams = req.nextUrl.searchParams;
  const slugParam = searchParams.get("slug") || undefined;
  const tenantSlug = resolveTenantSlug(user, slugParam);

  const targetUrl = `${getApiBase()}/admin/rachas/${tenantSlug}/comunicacao/broadcast/${id}`;
  const { response, body } = await proxyBackend(targetUrl, {
    headers: buildHeaders(user, tenantSlug),
    cache: "no-store",
  });

  return forwardResponse(response.status, body);
}
