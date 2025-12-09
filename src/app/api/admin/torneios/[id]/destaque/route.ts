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
import { buildTorneioPaths, triggerPublicRevalidate } from "../../../../_proxy/revalidate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
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

  const targetUrl = `${getApiBase()}/api/admin/torneios/${encodeURIComponent(params.id)}/destaque`;
  const { response, body } = await proxyBackend(targetUrl, {
    method: "PATCH",
    headers,
    body: rawBody,
  });

  if (response.ok) {
    const torneioSlug =
      body && typeof body === "object" && body !== null ? ((body as any).slug ?? null) : null;
    await triggerPublicRevalidate(tenantSlug, buildTorneioPaths(tenantSlug, torneioSlug));
  }

  return forwardResponse(response.status, body);
}
