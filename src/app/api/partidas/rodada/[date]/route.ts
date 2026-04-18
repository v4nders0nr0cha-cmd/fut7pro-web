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

const BASE_PATH = "/api/partidas/rodada";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE(req: NextRequest, { params }: { params: { date: string } }) {
  const user = await requireUser({ scope: "admin" });
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const payload = await req.json().catch(() => null);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return jsonResponse({ error: "Payload invalido" }, { status: 400 });
  }

  const headers = buildHeaders(user, tenantSlug, { includeContentType: true });
  headers["x-auth-context"] = "admin";

  const { response, body } = await proxyBackend(
    `${getApiBase()}${BASE_PATH}/${encodeURIComponent(params.date)}`,
    {
      method: "DELETE",
      cache: "no-store",
      headers,
      body: JSON.stringify({
        confirmation: (payload as { confirmation?: unknown }).confirmation,
        reason: (payload as { reason?: unknown }).reason,
      }),
    }
  );

  return forwardResponse(response.status, body);
}
