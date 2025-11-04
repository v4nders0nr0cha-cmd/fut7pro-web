import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  jsonResponse,
  requireUser,
  resolveTenantSlug,
  buildHeaders,
  proxyBackend,
  forwardResponse,
} from "../_proxy/helpers";

const JOGADORES_ENDPOINT = "/api/jogadores";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Não autenticado" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const tenantSlug = resolveTenantSlug(user, searchParams.get("slug"), searchParams.get("tenantSlug"));

  if (!tenantSlug) {
    return jsonResponse({ error: "tenantSlug obrigatório" }, { status: 400 });
  }

  const base = getApiBase();
  const url = new URL(`${base}${JOGADORES_ENDPOINT}`);

  searchParams.forEach((value, key) => {
    if (key !== "slug" && key !== "tenantSlug") {
      url.searchParams.set(key, value);
    }
  });

  try {
    const headers = buildHeaders(user, tenantSlug, { includeContentType: false });
    const { response, body } = await proxyBackend(url.toString(), {
      method: "GET",
      headers,
    });
    return forwardResponse(response.status, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse({ error: "Falha ao listar jogadores", details: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Não autenticado" }, { status: 401 });
  }

  let payload: Record<string, unknown> | null = null;
  try {
    payload = await req.json();
  } catch {
    payload = null;
  }

  if (!payload || typeof payload.name !== "string") {
    return jsonResponse({ error: "Campo obrigatório: name" }, { status: 400 });
  }

  const tenantSlug = resolveTenantSlug(
    user,
    typeof payload.tenantSlug === "string" ? payload.tenantSlug : null,
    typeof payload.slug === "string" ? payload.slug : null
  );

  if (!tenantSlug) {
    return jsonResponse({ error: "tenantSlug obrigatório" }, { status: 400 });
  }

  const base = getApiBase();
  const url = `${base}${JOGADORES_ENDPOINT}`;

  try {
    const headers = buildHeaders(user, tenantSlug);
    const { response, body } = await proxyBackend(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    return forwardResponse(response.status, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse({ error: "Falha ao criar jogador", details: message }, { status: 500 });
  }
}
