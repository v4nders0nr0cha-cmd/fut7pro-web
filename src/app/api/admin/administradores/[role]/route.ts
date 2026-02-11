import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  appendSafeQueryParams,
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../../../_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function forwardToBackend(
  req: NextRequest,
  role: string,
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

  const headers = buildHeaders(user, tenantSlug, { includeContentType });
  const targetUrl = new URL(`${getApiBase()}/admin/administradores/${role}`);
  appendSafeQueryParams(req.nextUrl.searchParams, targetUrl);

  const { response, body } = await proxyBackend(targetUrl.toString(), {
    ...init,
    headers,
  });

  return forwardResponse(response.status, body);
}

export async function PUT(req: NextRequest, context: { params: { role: string } }) {
  const rawBody = await req.text();
  return forwardToBackend(
    req,
    context.params.role,
    {
      method: "PUT",
      body: rawBody,
    },
    true
  );
}

export async function DELETE(req: NextRequest, context: { params: { role: string } }) {
  return forwardToBackend(
    req,
    context.params.role,
    {
      method: "DELETE",
    },
    false
  );
}
