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
import { buildSponsorPaths, triggerPublicRevalidate } from "../../../_proxy/revalidate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const BASE_PATH = "/sponsors";

async function forwardWithTenant(
  req: NextRequest,
  params: { id: string },
  init: RequestInit,
  includeContentType: boolean,
  onSuccess?: (params: { tenantSlug: string; body: any }) => Promise<void>
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
  const targetUrl = new URL(`${getApiBase()}${BASE_PATH}/${encodeURIComponent(params.id)}`);
  appendSafeQueryParams(req.nextUrl.searchParams, targetUrl);

  const { response, body } = await proxyBackend(targetUrl.toString(), {
    ...init,
    headers,
  });

  if (response.ok && onSuccess) {
    await onSuccess({ tenantSlug, body });
  }

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
    true,
    async ({ tenantSlug }) => {
      await triggerPublicRevalidate(tenantSlug, buildSponsorPaths(tenantSlug));
    }
  );
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return forwardWithTenant(
    req,
    params,
    {
      method: "DELETE",
    },
    false,
    async ({ tenantSlug }) => {
      await triggerPublicRevalidate(tenantSlug, buildSponsorPaths(tenantSlug));
    }
  );
}
