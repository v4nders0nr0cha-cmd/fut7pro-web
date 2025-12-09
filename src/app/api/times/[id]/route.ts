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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function forwardWithTenant(
  req: NextRequest,
  params: { id: string },
  init: RequestInit,
  includeContentType: boolean
) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const headers = buildHeaders(user, tenantSlug, {
    includeContentType,
  });

  const targetUrl = new URL(`${getApiBase()}/api/times/${encodeURIComponent(params.id)}`);
  req.nextUrl.searchParams.forEach((value, key) => targetUrl.searchParams.set(key, value));
  if (!targetUrl.searchParams.has("slug")) {
    targetUrl.searchParams.set("slug", tenantSlug);
  }

  const { response, body } = await proxyBackend(targetUrl.toString(), { ...init, headers });
  return forwardResponse(response.status, body);
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return forwardWithTenant(
    req,
    params,
    {
      method: "GET",
      cache: "no-store",
    },
    false
  );
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const rawBody = await req.text();
  return forwardWithTenant(
    req,
    params,
    {
      method: "PUT",
      body: rawBody,
    },
    true
  );
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return forwardWithTenant(
    req,
    params,
    {
      method: "DELETE",
    },
    false
  );
}
