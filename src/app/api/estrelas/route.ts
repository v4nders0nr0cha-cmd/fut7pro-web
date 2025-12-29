import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../_proxy/helpers";

const BASE_PATH = "/api/estrelas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function forwardToBackend(req: NextRequest, init: RequestInit, includeContentType: boolean) {
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
  req.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const { response, body } = await proxyBackend(targetUrl.toString(), {
    ...init,
    headers,
  });

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
  const body = await req.json();
  return forwardToBackend(
    req,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    true
  );
}
