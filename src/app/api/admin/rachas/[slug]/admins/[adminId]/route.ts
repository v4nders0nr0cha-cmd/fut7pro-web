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

const RACHAS_ENDPOINT = "/api/rachas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function buildAdminUrl(base: string, slug: string, adminId: string) {
  return `${base}${RACHAS_ENDPOINT}/${encodeURIComponent(slug)}/admins/${encodeURIComponent(adminId)}`;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string; adminId: string } }
) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const { slug, adminId } = params;
  if (!slug || !adminId) {
    return jsonResponse({ error: "Slug e adminId obrigatorios" }, { status: 400 });
  }

  let payload: Record<string, unknown> | null = null;
  try {
    payload = await req.json();
  } catch {
    payload = null;
  }

  if (!payload || (payload.role == null && payload.status == null)) {
    return jsonResponse({ error: "Envie role ou status para atualizar" }, { status: 400 });
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
  const url = buildAdminUrl(base, slug, adminId);

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
    return jsonResponse(
      { error: "Falha ao atualizar admin do racha", details: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string; adminId: string } }
) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const { slug, adminId } = params;
  if (!slug || !adminId) {
    return jsonResponse({ error: "Slug e adminId obrigatorios" }, { status: 400 });
  }

  const tenantSlug = resolveTenantSlug(user, req.nextUrl.searchParams.get("tenantSlug"), slug);
  if (!tenantSlug) {
    return jsonResponse({ error: "tenantSlug obrigatorio" }, { status: 400 });
  }

  const base = getApiBase();
  const url = buildAdminUrl(base, slug, adminId);

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
    return jsonResponse(
      { error: "Falha ao remover admin do racha", details: message },
      { status: 500 }
    );
  }
}
