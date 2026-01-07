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

const BASE_PATH = "/api/partidas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function forwardToBackend(req: NextRequest, init: RequestInit, matchId: string) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const headers = buildHeaders(user, tenantSlug);
  const targetUrl = new URL(`${getApiBase()}${BASE_PATH}/${matchId}`);
  req.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const { response, body } = await proxyBackend(targetUrl.toString(), {
    ...init,
    headers,
  });

  return forwardResponse(response.status, body);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return forwardToBackend(
    req,
    {
      method: "DELETE",
      cache: "no-store",
    },
    params.id
  );
}
