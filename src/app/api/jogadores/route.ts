import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../_proxy/helpers";

const BASE_PATH = "/api/jogadores";
const TENANT_QUERY_KEYS = new Set(["tenantId", "tenantSlug", "rachaId", "slug"]);

function sanitizeTenantFields(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return payload;
  const safePayload = { ...(payload as Record<string, unknown>) };
  delete safePayload.tenantId;
  delete safePayload.tenantSlug;
  delete safePayload.rachaId;
  delete safePayload.slug;
  return safePayload;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function forwardToBackend(req: NextRequest, init: RequestInit, includeContentType: boolean) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const headers = buildHeaders(user, tenantSlug, {
    includeContentType,
  });

  const targetUrl = new URL(`${getApiBase()}${BASE_PATH}`);
  req.nextUrl.searchParams.forEach((value, key) => {
    if (TENANT_QUERY_KEYS.has(key)) return;
    targetUrl.searchParams.set(key, value);
  });

  const { response, body } = await proxyBackend(targetUrl.toString(), {
    ...init,
    headers,
  });

  return forwardResponse(response.status, body);
}

export async function GET(req: NextRequest) {
  return forwardToBackend(
    req,
    {
      method: "GET",
      cache: "no-store",
    },
    false
  );
}

export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => null);
  if (!payload) {
    return jsonResponse({ error: "Payload invalido" }, { status: 400 });
  }
  const safePayload = sanitizeTenantFields(payload);

  return forwardToBackend(
    req,
    {
      method: "POST",
      body: JSON.stringify(safePayload),
    },
    true
  );
}
