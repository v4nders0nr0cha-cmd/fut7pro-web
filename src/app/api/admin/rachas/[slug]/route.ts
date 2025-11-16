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
import { revalidateTenantPublicPages } from "@/lib/revalidate-public";

const RACHAS_ENDPOINT = "/api/rachas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function proxyRachaRequest(
  req: NextRequest,
  params: { slug?: string },
  init: RequestInit,
  includeContentType = true,
  shouldRevalidate = false
) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(
    user,
    params.slug,
    req.nextUrl.searchParams.get("slug"),
    req.nextUrl.searchParams.get("tenantSlug")
  );

  if (!tenantSlug) {
    return jsonResponse({ error: "tenantSlug obrigatorio" }, { status: 400 });
  }

  const base = getApiBase();
  const url = `${base}${RACHAS_ENDPOINT}/${encodeURIComponent(params.slug ?? tenantSlug)}`;

  const headers = buildHeaders(user, tenantSlug, { includeContentType });
  const { response, body } = await proxyBackend(url, {
    ...init,
    headers,
  });

  if (shouldRevalidate && response.ok) {
    revalidateTenantPublicPages(tenantSlug);
  }

  return forwardResponse(response.status, body);
}

export async function GET(req: NextRequest, context: { params: { slug: string } }) {
  return proxyRachaRequest(
    req,
    context.params,
    {
      method: "GET",
    },
    false
  );
}

export async function PATCH(req: NextRequest, context: { params: { slug: string } }) {
  const body = await req.json();
  return proxyRachaRequest(
    req,
    context.params,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
    true,
    true
  );
}

export async function PUT(req: NextRequest, context: { params: { slug: string } }) {
  const body = await req.json();
  return proxyRachaRequest(
    req,
    context.params,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
    true,
    true
  );
}

export async function DELETE(req: NextRequest, context: { params: { slug: string } }) {
  const body = await req.json().catch(() => null);
  return proxyRachaRequest(
    req,
    context.params,
    {
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
    },
    Boolean(body),
    true
  );
}
