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
} from "../utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Não autenticado" }, { status: 401 });
  }

  const id = params.id;
  if (!id) {
    return jsonResponse({ error: "ID obrigatório" }, { status: 400 });
  }

  let payload: any = null;
  try {
    payload = await req.json();
  } catch {
    payload = null;
  }

  const tenantSlug = resolveTenantSlug(
    user,
    req.nextUrl.searchParams.get("slug"),
    payload?.tenantSlug,
    payload?.slug
  );

  if (!tenantSlug) {
    return jsonResponse({ error: "tenantSlug obrigatório" }, { status: 400 });
  }

  const tenantId = ensureTenantId(user, payload?.tenantId ?? null);
  if (!tenantId) {
    return jsonResponse({ error: "tenantId obrigatório" }, { status: 400 });
  }

  const updatePayload: Record<string, unknown> = {};
  if (payload && typeof payload === "object") {
    if (typeof payload.title === "string") updatePayload.title = payload.title;
    if (typeof payload.message === "string") updatePayload.message = payload.message;
    if (typeof payload.type === "string") updatePayload.type = payload.type;
    if (typeof payload.isRead === "boolean") updatePayload.isRead = payload.isRead;
    if (payload.metadata !== undefined) updatePayload.metadata = payload.metadata;
  }
  updatePayload.tenantId = tenantId;

  const base = getApiBase();
  const url = `${base}${NOTIFICATIONS_ENDPOINT}/${encodeURIComponent(id)}`;

  try {
    const headers = buildHeaders(user, tenantSlug);
    const { response, body } = await proxyBackend(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(updatePayload),
    });
    return forwardResponse(response.status, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse(
      { error: "Falha ao atualizar notificação", details: message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Não autenticado" }, { status: 401 });
  }

  const id = params.id;
  if (!id) {
    return jsonResponse({ error: "ID obrigatório" }, { status: 400 });
  }

  const tenantSlug = resolveTenantSlug(
    user,
    req.nextUrl.searchParams.get("slug"),
    req.nextUrl.searchParams.get("tenantSlug")
  );

  if (!tenantSlug) {
    return jsonResponse({ error: "tenantSlug obrigatório" }, { status: 400 });
  }

  const base = getApiBase();
  const url = `${base}${NOTIFICATIONS_ENDPOINT}/${encodeURIComponent(id)}`;

  try {
    const headers = buildHeaders(user, tenantSlug, { includeContentType: false });
    const { response, body } = await proxyBackend(url, {
      method: "DELETE",
      headers,
    });
    return forwardResponse(response.status, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse(
      { error: "Falha ao excluir notificação", details: message },
      { status: 500 }
    );
  }
}
