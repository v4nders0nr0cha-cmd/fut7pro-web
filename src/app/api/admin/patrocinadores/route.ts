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
import { buildSponsorPaths, triggerPublicRevalidate } from "../../_proxy/revalidate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const BASE_PATH = "/sponsors";

async function forwardToBackend(
  req: NextRequest,
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
  const targetUrl = new URL(`${getApiBase()}${BASE_PATH}`);
  req.nextUrl.searchParams.forEach((value, key) => targetUrl.searchParams.set(key, value));

  const { response, body } = await proxyBackend(targetUrl.toString(), {
    ...init,
    headers,
  });

  if (response.ok && onSuccess) {
    await onSuccess({ tenantSlug, body });
  }

  return forwardResponse(response.status, body);
}

export async function GET(req: NextRequest) {
  return forwardToBackend(
    req,
    {
      method: "GET",
      cache: "no-store",
    },
    false
  );
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  return forwardToBackend(
    req,
    {
      method: "POST",
      body: rawBody,
    },
    true,
    async ({ tenantSlug }) => {
      await triggerPublicRevalidate(tenantSlug, buildSponsorPaths(tenantSlug));
    }
  );
}
