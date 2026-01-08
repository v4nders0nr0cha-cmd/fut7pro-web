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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteParams = { params: { id?: string } };

export async function GET(_req: NextRequest, context: RouteParams) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const id = context.params.id;
  if (!id) {
    return jsonResponse({ error: "ID obrigatorio" }, { status: 400 });
  }

  const tenantSlug = resolveTenantSlug(user);
  const { response, body } = await proxyBackend(`${getApiBase()}/rachas/${id}`, {
    headers: buildHeaders(user, tenantSlug),
    cache: "no-store",
  });

  return forwardResponse(response.status, body);
}

export async function PUT(req: NextRequest, context: RouteParams) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const id = context.params.id;
  if (!id) {
    return jsonResponse({ error: "ID obrigatorio" }, { status: 400 });
  }

  const payload = await req.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return jsonResponse({ error: "Payload invalido" }, { status: 400 });
  }

  const tenantSlug = resolveTenantSlug(user);
  const { response, body } = await proxyBackend(`${getApiBase()}/rachas/${id}`, {
    method: "PUT",
    headers: buildHeaders(user, tenantSlug, { includeContentType: true }),
    body: JSON.stringify(payload),
  });

  return forwardResponse(response.status, body);
}
