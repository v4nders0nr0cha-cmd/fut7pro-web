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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(_req: NextRequest, { params }: { params: { id?: string } }) {
  const user = await requireUser();
  if (!user) return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  if (!params?.id) return jsonResponse({ error: "ID obrigatorio" }, { status: 400 });

  const tenantSlug = resolveTenantSlug(user);
  const { response, body } = await proxyBackend(
    `${getApiBase()}/api/jogadores/${encodeURIComponent(params.id)}/archive`,
    { method: "POST", headers: buildHeaders(user, tenantSlug) }
  );
  return forwardResponse(response.status, body);
}
