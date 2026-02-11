import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  appendSafeQueryParams,
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../../_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const slugParam = req.nextUrl.searchParams.get("slug") || undefined;
  const tenantSlug = resolveTenantSlug(user, slugParam);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const targetUrl = new URL(`${getApiBase()}/admin/suggestions`);
  appendSafeQueryParams(req.nextUrl.searchParams, targetUrl);

  const { response, body } = await proxyBackend(targetUrl.toString(), {
    headers: buildHeaders(user, tenantSlug),
    cache: "no-store",
  });

  return forwardResponse(response.status, body);
}

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

  const body = await req.text();
  const { response, body: backendBody } = await proxyBackend(`${getApiBase()}/admin/suggestions`, {
    method: "POST",
    headers: buildHeaders(user, tenantSlug, { includeContentType: true }),
    body,
  });

  return forwardResponse(response.status, backendBody);
}
