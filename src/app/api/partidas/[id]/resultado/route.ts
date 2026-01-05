import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../../../_proxy/helpers";
import { buildSorteioPaths, triggerPublicRevalidate } from "../../../_proxy/revalidate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(req: NextRequest, { params }: { params: { id?: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const matchId = params?.id;
  if (!matchId) {
    return jsonResponse({ error: "ID obrigatorio" }, { status: 400 });
  }

  const payload = await req.json().catch(() => null);
  if (!payload) {
    return jsonResponse({ error: "Payload invalido" }, { status: 400 });
  }

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const { response, body } = await proxyBackend(
    `${getApiBase()}/api/partidas/${matchId}/resultado`,
    {
      method: "PUT",
      headers: buildHeaders(user, tenantSlug, { includeContentType: true }),
      body: JSON.stringify(payload),
    }
  );

  if (response.ok) {
    const paths = [...buildSorteioPaths(tenantSlug), `/${tenantSlug}/partidas/detalhes/${matchId}`];
    await triggerPublicRevalidate(tenantSlug, paths);
  }

  return forwardResponse(response.status, body);
}
