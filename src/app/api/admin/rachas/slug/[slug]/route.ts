import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../../../../_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteParams = { params: { slug?: string } };

export async function PUT(req: NextRequest, context: RouteParams) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const currentSlug = context.params.slug || resolveTenantSlug(user);
  if (!currentSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const payload = await req.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return jsonResponse({ error: "Payload invalido" }, { status: 400 });
  }

  const headers = buildHeaders(user, currentSlug, { includeContentType: true });
  const base = getApiBase().replace(/\/+$/, "");
  const { response, body } = await proxyBackend(
    `${base}/rachas/slug/${encodeURIComponent(currentSlug)}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    }
  );

  return forwardResponse(response.status, body);
}
