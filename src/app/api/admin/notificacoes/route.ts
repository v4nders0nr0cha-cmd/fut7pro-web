import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  jsonResponse,
  requireUser,
  resolveTenantSlug,
  buildHeaders,
  proxyBackend,
  forwardResponse,
  ensureTenantId,
  NOTIFICATIONS_ENDPOINT,
} from "./utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Não autenticado" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const tenantSlug = resolveTenantSlug(
    user,
    searchParams.get("slug"),
    searchParams.get("tenantSlug")
  );

  if (!tenantSlug) {
    return jsonResponse({ error: "Tenant slug obrigatório" }, { status: 400 });
  }

  const base = getApiBase();
  const url = new URL(`${base}${NOTIFICATIONS_ENDPOINT}`);

  const allowedParams = ["type", "isRead", "limit", "search"];
  for (const param of allowedParams) {
    const value = searchParams.get(param);
    if (value !== null && value !== "") {
      url.searchParams.set(param, value);
    }
  }

  try {
    const headers = buildHeaders(user, tenantSlug, { includeContentType: false });
    const { response, body } = await proxyBackend(url.toString(), { method: "GET", headers });
    return forwardResponse(response.status, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse(
      { error: "Falha ao listar notificações", details: message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Não autenticado" }, { status: 401 });
  }

  let payload: any = null;
  try {
    payload = await req.json();
  } catch {
    payload = null;
  }

  if (
    !payload ||
    typeof payload.title !== "string" ||
    typeof payload.message !== "string" ||
    typeof payload.type !== "string"
  ) {
    return jsonResponse({ error: "Campos obrigatórios: title, message, type" }, { status: 400 });
  }

  const tenantId = ensureTenantId(user, payload.tenantId ?? null);
  if (!tenantId) {
    return jsonResponse({ error: "tenantId obrigatório" }, { status: 400 });
  }

  const tenantSlug = resolveTenantSlug(user, payload.tenantSlug, payload.slug, payload.tenant);
  if (!tenantSlug) {
    return jsonResponse({ error: "tenantSlug obrigatório" }, { status: 400 });
  }

  const base = getApiBase();
  const url = `${base}${NOTIFICATIONS_ENDPOINT}`;

  try {
    const headers = buildHeaders(user, tenantSlug);
    const cleanPayload = {
      title: payload.title,
      message: payload.message,
      type: payload.type,
      tenantId,
      metadata: payload.metadata ?? undefined,
    };
    const { response, body } = await proxyBackend(url, {
      method: "POST",
      headers,
      body: JSON.stringify(cleanPayload),
    });
    return forwardResponse(response.status, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse({ error: "Falha ao criar notificação", details: message }, { status: 500 });
  }
}
