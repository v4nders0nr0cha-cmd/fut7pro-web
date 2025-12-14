import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  resolveTenantSlug,
  requireUser,
} from "../../_proxy/helpers";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(user);
  const targetUrl = new URL(`${getApiBase()}/financeiro`);
  const search = new URL(req.url).search;
  if (search) {
    targetUrl.search = search;
  }

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

  const payload = await req.json().catch(() => null);
  if (!payload) {
    return jsonResponse({ error: "Payload invalido" }, { status: 400 });
  }

  const tenantSlug = resolveTenantSlug(user);
  const { response, body } = await proxyBackend(`${getApiBase()}/financeiro`, {
    method: "POST",
    headers: buildHeaders(user, tenantSlug, { includeContentType: true }),
    body: JSON.stringify(payload),
  });

  return forwardResponse(response.status, body);
}
