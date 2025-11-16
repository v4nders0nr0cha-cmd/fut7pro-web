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
import { revalidateTenantPublicPages } from "@/lib/revalidate-public";

const RACHAS_ENDPOINT = "/api/rachas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function buildAdminsUrl(base: string, slug: string) {
  return `${base}${RACHAS_ENDPOINT}/${encodeURIComponent(slug)}/admins`;
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const slug = params.slug;
  if (!slug || slug.trim().length === 0) {
    return jsonResponse({ error: "Slug obrigatorio" }, { status: 400 });
  }

  const tenantSlug = resolveTenantSlug(
    user,
    slug,
    req.nextUrl.searchParams.get("tenantSlug"),
    req.nextUrl.searchParams.get("slug")
  );

  if (!tenantSlug) {
    return jsonResponse({ error: "tenantSlug obrigatorio" }, { status: 400 });
  }

  const base = getApiBase();
  const url = buildAdminsUrl(base, slug);

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
      { error: "Falha ao listar admins do racha", details: message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const slug = params.slug;
  if (!slug || slug.trim().length === 0) {
    return jsonResponse({ error: "Slug obrigatorio" }, { status: 400 });
  }

  let payload: Record<string, unknown> | null = null;
  try {
    payload = await req.json();
  } catch {
    payload = null;
  }

  if (!payload || typeof payload.email !== "string" || typeof payload.role !== "string") {
    return jsonResponse({ error: "Campos obrigatorios: email, role" }, { status: 400 });
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
  const url = buildAdminsUrl(base, slug);

  try {
    const headers = buildHeaders(user, tenantSlug);
    const { response, body } = await proxyBackend(url, {
      method: "POST",
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
      { error: "Falha ao criar admin do racha", details: message },
      { status: 500 }
    );
  }
}
