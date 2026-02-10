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

  const slugParam = req.nextUrl.searchParams.get("slug") || undefined;
  const tenantSlug = resolveTenantSlug(user, slugParam);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const payload = await req.text();
  const { response, body } = await proxyBackend(
    `${getApiBase()}/admin/support/tickets/cancelamento-racha`,
    {
      method: "POST",
      headers: buildHeaders(user, tenantSlug, { includeContentType: true }),
      body: payload,
    }
  );

  return forwardResponse(response.status, body);
}
