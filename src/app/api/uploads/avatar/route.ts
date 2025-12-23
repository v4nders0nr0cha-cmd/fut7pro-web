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

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const requestTenantSlug = req.headers.get("x-tenant-slug") || undefined;
  const tenantSlug = resolveTenantSlug(user, requestTenantSlug);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const formData = await req.formData();
  const headers = buildHeaders(user, tenantSlug, {});

  const targetUrl = `${getApiBase()}/uploads/avatar`;
  const { response, body } = await proxyBackend(targetUrl, {
    method: "POST",
    headers,
    body: formData,
  });

  return forwardResponse(response.status, body);
}
