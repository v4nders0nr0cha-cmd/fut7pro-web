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
import { revalidateFinancePages } from "../revalidate";

const FINANCE_ENDPOINT = "/api/admin/financeiro";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function resolveFinanceTenant(user: any, req: NextRequest, bodyTenant?: string | null) {
  return resolveTenantSlug(
    user,
    req.nextUrl.searchParams.get("slug"),
    req.nextUrl.searchParams.get("tenantSlug"),
    bodyTenant ?? undefined
  );
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveFinanceTenant(user, req);
  if (!tenantSlug) {
    return jsonResponse({ error: "tenantSlug obrigatorio" }, { status: 400 });
  }

  const base = getApiBase();
  const url = `${base}${FINANCE_ENDPOINT}/${encodeURIComponent(params.id)}`;

  try {
    const headers = buildHeaders(user, tenantSlug, { includeContentType: false });
    const { response, body } = await proxyBackend(url, {
      method: "GET",
      headers,
    });
    return forwardResponse(response.status, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse(
      { error: "Falha ao consultar lancamento", details: message },
      { status: 500 }
    );
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

  const tenantSlug = resolveFinanceTenant(
    user,
    req,
    typeof payload.tenantSlug === "string" ? payload.tenantSlug : null
  );

  if (!tenantSlug) {
    return jsonResponse({ error: "tenantSlug obrigatorio" }, { status: 400 });
  }

  const base = getApiBase();
  const url = `${base}${FINANCE_ENDPOINT}/${encodeURIComponent(params.id)}`;

  try {
    const headers = buildHeaders(user, tenantSlug);
    const { response, body } = await proxyBackend(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      revalidateFinancePages(tenantSlug);
    }
    return forwardResponse(response.status, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse(
      { error: "Falha ao atualizar lancamento", details: message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveFinanceTenant(user, req);
  if (!tenantSlug) {
    return jsonResponse({ error: "tenantSlug obrigatorio" }, { status: 400 });
  }

  const base = getApiBase();
  const url = `${base}${FINANCE_ENDPOINT}/${encodeURIComponent(params.id)}`;

  try {
    const headers = buildHeaders(user, tenantSlug, { includeContentType: false });
    const { response, body } = await proxyBackend(url, {
      method: "DELETE",
      headers,
    });
    if (response.ok || response.status === 204) {
      revalidateFinancePages(tenantSlug);
    }
    return forwardResponse(response.status, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse(
      { error: "Falha ao remover lancamento", details: message },
      { status: 500 }
    );
  }
}
