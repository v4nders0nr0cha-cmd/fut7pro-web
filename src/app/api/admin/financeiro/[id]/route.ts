import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  resolveTenantSlug,
  requireUser,
} from "../../../_proxy/helpers";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

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

export async function PUT(req: NextRequest, { params }: { params: { id?: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }
  const id = params?.id;
  if (!id) {
    return jsonResponse({ error: "ID obrigatorio" }, { status: 400 });
  }

  const payload = await req.json().catch(() => null);
  if (!payload) {
    return jsonResponse({ error: "Payload invalido" }, { status: 400 });
  }

  const tenantSlug = resolveTenantSlug(user);
  const safePayload = sanitizeFinanceiroPayload(payload);
  const { response, body } = await proxyBackend(`${getApiBase()}/financeiro/${id}`, {
    method: "PUT",
    headers: buildHeaders(user, tenantSlug, { includeContentType: true }),
    body: JSON.stringify(safePayload),
  });

  return forwardResponse(response.status, body);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id?: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }
  const id = params?.id;
  if (!id) {
    return jsonResponse({ error: "ID obrigatorio" }, { status: 400 });
  }

  const tenantSlug = resolveTenantSlug(user);
  const { response, body } = await proxyBackend(`${getApiBase()}/financeiro/${id}`, {
    method: "DELETE",
    headers: buildHeaders(user, tenantSlug),
  });

  return forwardResponse(response.status, body);
}
