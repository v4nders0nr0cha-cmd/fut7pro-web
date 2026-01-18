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

const BASE_PATH = "/admin/solicitacoes/auto-approve";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const headers = buildHeaders(user, tenantSlug, { includeContentType: false });
  const { response, body } = await proxyBackend(`${getApiBase()}${BASE_PATH}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  return forwardResponse(response.status, body);
}

export async function PUT(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const payload = await req.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return jsonResponse({ error: "Payload invalido" }, { status: 400 });
  }

  const headers = buildHeaders(user, tenantSlug, { includeContentType: true });
  const { response, body } = await proxyBackend(`${getApiBase()}${BASE_PATH}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });

  return forwardResponse(response.status, body);
}
