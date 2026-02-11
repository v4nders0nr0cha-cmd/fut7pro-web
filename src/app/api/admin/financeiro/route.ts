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
const TENANT_QUERY_KEYS = new Set(["tenantId", "tenantSlug", "rachaId", "slug"]);

function applySafeQueryParams(source: URLSearchParams, target: URL) {
  source.forEach((value, key) => {
    if (TENANT_QUERY_KEYS.has(key)) return;
    target.searchParams.set(key, value);
  });
}

function sanitizeFinanceiroPayload(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return payload;
  const { tenantId, tenantSlug, rachaId, slug, ...safePayload } = payload as Record<
    string,
    unknown
  >;
  void tenantId;
  void tenantSlug;
  void rachaId;
  void slug;
  return safePayload;
}

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(user);
  const targetUrl = new URL(`${getApiBase()}/financeiro`);
  applySafeQueryParams(req.nextUrl.searchParams, targetUrl);

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
  const safePayload = sanitizeFinanceiroPayload(payload);
  const { response, body } = await proxyBackend(`${getApiBase()}/financeiro`, {
    method: "POST",
    headers: buildHeaders(user, tenantSlug, { includeContentType: true }),
    body: JSON.stringify(safePayload),
  });

  return forwardResponse(response.status, body);
}
