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

const TIMES_ENDPOINT = "/api/times";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    req.nextUrl.searchParams.get("tenantSlug"),
    req.nextUrl.searchParams.get("slug"),
    slug
  );
  if (!tenantSlug) {
    return jsonResponse({ error: "tenantSlug obrigatorio" }, { status: 400 });
  }

  const base = getApiBase();
  const url = new URL(`${base}${TIMES_ENDPOINT}`);
  req.nextUrl.searchParams.forEach((value, key) => {
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
    return jsonResponse({ error: "Falha ao listar times", details: message }, { status: 500 });
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

  if (!payload || typeof payload.nome !== "string") {
    return jsonResponse({ error: "Campos obrigatorios do time nao informados" }, { status: 400 });
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
  const url = `${base}${TIMES_ENDPOINT}`;

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
    return jsonResponse({ error: "Falha ao criar time", details: message }, { status: 500 });
  }
}
