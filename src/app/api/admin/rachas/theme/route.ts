import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../../../_proxy/helpers";
import { triggerPublicRevalidate } from "../../../_proxy/revalidate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const payload = await req.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return jsonResponse({ error: "Payload invalido" }, { status: 400 });
  }

  const themeKey =
    typeof (payload as { themeKey?: unknown }).themeKey === "string"
      ? String((payload as { themeKey?: unknown }).themeKey)
      : "";
  if (!themeKey) {
    return jsonResponse({ error: "themeKey obrigatorio" }, { status: 400 });
  }

  const requestedSlug =
    typeof (payload as { tenantSlug?: unknown }).tenantSlug === "string"
      ? String((payload as { tenantSlug?: unknown }).tenantSlug).trim()
      : "";
  const tenantSlug = resolveTenantSlug(user, requestedSlug || undefined);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const headers = buildHeaders(user, tenantSlug, { includeContentType: true });
  const base = getApiBase().replace(/\/+$/, "");
  const { response, body } = await proxyBackend(`${base}/rachas/theme`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ themeKey }),
  });

  if (response.ok) {
    await triggerPublicRevalidate(tenantSlug);
  }

  return forwardResponse(response.status, body);
}
