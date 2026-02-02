import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
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

async function buildTargetUrl(req: NextRequest) {
  const targetUrl = new URL(`${getApiBase()}/logs`);
  req.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });
  return targetUrl.toString();
}

async function requireAuthHeaders(includeContentType = false) {
  const user = await requireUser();
  if (!user) {
    return { user: null, headers: null, tenantSlug: null };
  }

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return { user, headers: null, tenantSlug: null };
  }

  const headers = buildHeaders(user, tenantSlug, { includeContentType });
  return { user, headers, tenantSlug };
}

export async function GET(req: NextRequest) {
  const { user, headers, tenantSlug } = await requireAuthHeaders(false);
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }
  if (!headers || !tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const targetUrl = await buildTargetUrl(req);
  const { response, body } = await proxyBackend(targetUrl, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  return forwardResponse(response.status, body);
}

export async function POST(req: NextRequest) {
  const { user, headers, tenantSlug } = await requireAuthHeaders(true);
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }
  if (!headers || !tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const targetUrl = await buildTargetUrl(req);
  const payload = await req.text();
  const { response, body } = await proxyBackend(targetUrl, {
    method: "POST",
    headers,
    body: payload || undefined,
    cache: "no-store",
  });

  return forwardResponse(response.status, body);
}
