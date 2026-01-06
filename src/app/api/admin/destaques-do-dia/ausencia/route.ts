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

const BASE_PATH = "/api/admin/destaques-do-dia/ausencia";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function forwardToBackend(req: NextRequest, init: RequestInit) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const headers = buildHeaders(user, tenantSlug, {
    includeContentType: true,
  });

  const targetUrl = new URL(`${getApiBase()}${BASE_PATH}`);

  const { response, body } = await proxyBackend(targetUrl.toString(), {
    ...init,
    headers,
  });

  return forwardResponse(response.status, body);
}

export async function PATCH(req: NextRequest) {
  const payload = await req.json().catch(() => null);
  if (!payload) {
    return jsonResponse({ error: "Payload invalido" }, { status: 400 });
  }

  return forwardToBackend(req, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
