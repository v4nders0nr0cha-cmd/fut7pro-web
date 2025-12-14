import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../../../../../_proxy/helpers";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { tenantId?: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantId = params?.tenantId;
  if (!tenantId) {
    return jsonResponse({ error: "TenantId obrigatorio" }, { status: 400 });
  }

  const tenantSlug = resolveTenantSlug(user);
  const { response, body } = await proxyBackend(
    `${getApiBase()}/billing/subscription/tenant/${tenantId}`,
    {
      headers: buildHeaders(user, tenantSlug),
      cache: "no-store",
    }
  );

  return forwardResponse(response.status, body);
}
