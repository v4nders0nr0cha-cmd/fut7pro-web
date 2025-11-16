import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../../../../_proxy/helpers";
import { revalidateTenantPublicPages } from "@/lib/revalidate-public";

const TIMES_ENDPOINT = "/api/times";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function buildTimeUrl(base: string, timeId: string) {
  return `${base}${TIMES_ENDPOINT}/${encodeURIComponent(timeId)}`;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string; timeId: string } }
) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const { slug, timeId } = params;
  if (!slug || !timeId) {
    return jsonResponse({ error: "Slug e timeId obrigatorios" }, { status: 400 });
  }

  let payload: Record<string, unknown> | null = null;
  try {
    payload = await req.json();
  } catch {
    payload = null;
  }

  if (!payload) {
    return jsonResponse({ error: "Corpo da requisicao obrigatorio" }, { status: 400 });
  }

  const tenantSlug = resolveTenantSlug(
    user,
    typeof payload.tenantSlug === "string" ? payload.tenantSlug : null,
    slug
  );
  if (!tenantSlug) {
    return jsonResponse({ error: "tenantSlug obrigatorio" }, { status: 400 });
  }

  const base = getApiBase();
  const url = buildTimeUrl(base, timeId);

  try {
    const headers = buildHeaders(user, tenantSlug);
    const { response, body } = await proxyBackend(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      revalidateTenantPublicPages(tenantSlug);
    }
    return forwardResponse(response.status, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse({ error: "Falha ao atualizar time", details: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string; timeId: string } }
) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const { slug, timeId } = params;
  if (!slug || !timeId) {
    return jsonResponse({ error: "Slug e timeId obrigatorios" }, { status: 400 });
  }

  const tenantSlug = resolveTenantSlug(user, req.nextUrl.searchParams.get("tenantSlug"), slug);
  if (!tenantSlug) {
    return jsonResponse({ error: "tenantSlug obrigatorio" }, { status: 400 });
  }

  const base = getApiBase();
  const url = buildTimeUrl(base, timeId);

  try {
    const headers = buildHeaders(user, tenantSlug, { includeContentType: false });
    const { response, body } = await proxyBackend(url, {
      method: "DELETE",
      headers,
    });
    if (response.ok) {
      revalidateTenantPublicPages(tenantSlug);
    }
    return forwardResponse(response.status, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse({ error: "Falha ao remover time", details: message }, { status: 500 });
  }
}
