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

const BASE_PATH = "/api/partidas";
const TENANT_QUERY_KEYS = new Set(["tenantId", "tenantSlug", "rachaId", "slug"]);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function forwardToBackend(req: NextRequest, init: RequestInit, matchId: string) {
  const user = await requireUser({ scope: "admin" });
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const headers = buildHeaders(user, tenantSlug, {
    includeContentType: Boolean(init.body),
  });
  headers["x-auth-context"] = "admin";
  const targetUrl = new URL(`${getApiBase()}${BASE_PATH}/${matchId}`);
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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = await req.json().catch(() => null);
  return forwardToBackend(
    req,
    {
      method: "DELETE",
      cache: "no-store",
      ...(payload ? { body: JSON.stringify(payload) } : {}),
    },
    params.id
  );
}
