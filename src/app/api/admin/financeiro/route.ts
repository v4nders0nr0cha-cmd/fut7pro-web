import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../_proxy/helpers";
import { revalidateFinancePages } from "./revalidate";

const FINANCE_ENDPOINT = "/api/admin/financeiro";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function buildBackendUrl(req: NextRequest, base: string) {
  const url = new URL(`${base}${FINANCE_ENDPOINT}`);
  req.nextUrl.searchParams.forEach((value, key) => {
    if (key !== "slug" && key !== "tenantSlug") {
      url.searchParams.set(key, value);
    }
  });
  return url;
}

function resolveFinanceTenant(user: any, req: NextRequest, bodyTenant?: string | null) {
  return resolveTenantSlug(
    user,
    req.nextUrl.searchParams.get("slug"),
    req.nextUrl.searchParams.get("tenantSlug"),
    bodyTenant ?? undefined
  );
}

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveFinanceTenant(user, req);
  if (!tenantSlug) {
    return jsonResponse({ error: "tenantSlug obrigatorio" }, { status: 400 });
  }

  const base = getApiBase();
  const url = buildBackendUrl(req, base);

  try {
    const headers = buildHeaders(user, tenantSlug, { includeContentType: false });
    const { response, body } = await proxyBackend(url.toString(), {
      method: "GET",
      headers,
    });
    return forwardResponse(response.status, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse({ error: "Falha ao listar financeiro", details: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
  const url = `${base}${FINANCE_ENDPOINT}`;

  try {
    const headers = buildHeaders(user, tenantSlug);
    const { response, body } = await proxyBackend(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      revalidateFinancePages(tenantSlug);
    }
    return forwardResponse(response.status, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse({ error: "Falha ao criar lancamento", details: message }, { status: 500 });
  }
}
