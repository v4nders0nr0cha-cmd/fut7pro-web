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
import { revalidateTorneios } from "../revalidate";

const ENDPOINT = "/api/admin/torneios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(
    user,
    req.nextUrl.searchParams.get("slug"),
    req.nextUrl.searchParams.get("tenantSlug")
  );

  if (!tenantSlug) {
    return jsonResponse({ error: "tenantSlug obrigatorio" }, { status: 400 });
  }

  const base = getApiBase();
  const url = `${base}${ENDPOINT}/${encodeURIComponent(params.id)}`;

  try {
    const headers = buildHeaders(user, tenantSlug, { includeContentType: false });
    const { response, body } = await proxyBackend(url, { method: "GET", headers });
    return forwardResponse(response.status, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse({ error: "Falha ao consultar torneio", details: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  let payload: any = null;
  try {
    payload = await req.json();
  } catch {
    payload = null;
  }

  if (!payload || typeof payload !== "object") {
    return jsonResponse({ error: "Corpo da requisicao obrigatorio" }, { status: 400 });
  }

  const tenantSlug = resolveTenantSlug(
    user,
    req.nextUrl.searchParams.get("slug"),
    req.nextUrl.searchParams.get("tenantSlug"),
    typeof payload.tenantSlug === "string" ? payload.tenantSlug : undefined
  );

  if (!tenantSlug) {
    return jsonResponse({ error: "tenantSlug obrigatorio" }, { status: 400 });
  }

  const base = getApiBase();
  const url = `${base}${ENDPOINT}/${encodeURIComponent(params.id)}`;

  try {
    const headers = buildHeaders(user, tenantSlug);
    const { response, body } = await proxyBackend(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      let torneioSlug: string | undefined;
      try {
        const parsed = body ? JSON.parse(body) : null;
        torneioSlug = parsed?.slug;
      } catch {
        torneioSlug = undefined;
      }
      revalidateTorneios(tenantSlug, torneioSlug);
    }
    return forwardResponse(response.status, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse({ error: "Falha ao atualizar torneio", details: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(
    user,
    req.nextUrl.searchParams.get("slug"),
    req.nextUrl.searchParams.get("tenantSlug")
  );

  if (!tenantSlug) {
    return jsonResponse({ error: "tenantSlug obrigatorio" }, { status: 400 });
  }

  const base = getApiBase();
  const url = `${base}${ENDPOINT}/${encodeURIComponent(params.id)}`;

  try {
    const headers = buildHeaders(user, tenantSlug, { includeContentType: false });
    const { response, body } = await proxyBackend(url, { method: "DELETE", headers });
    if (response.ok || response.status === 204) {
      revalidateTorneios(tenantSlug);
    }
    return forwardResponse(response.status, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse({ error: "Falha ao remover torneio", details: message }, { status: 500 });
  }
}
