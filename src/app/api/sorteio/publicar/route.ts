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
import { buildSorteioPaths, triggerPublicRevalidate } from "../../_proxy/revalidate";

const BASE_PATH = "/api/sorteio/publicar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const headers = buildHeaders(user, tenantSlug, { includeContentType: true });
  const rawBody = await req.text();
  const targetUrl = `${getApiBase()}${BASE_PATH}`;

  const { response, body } = await proxyBackend(targetUrl, {
    method: "POST",
    headers,
    body: rawBody,
  });

  if (response.ok) {
    await triggerPublicRevalidate(tenantSlug, buildSorteioPaths(tenantSlug));
  }

  return forwardResponse(response.status, body);
}
