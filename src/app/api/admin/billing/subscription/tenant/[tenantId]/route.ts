import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
} from "../../../../../_proxy/helpers";
import { resolveScopedTenant } from "../../_scope";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { tenantId?: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const scopedTenant = await resolveScopedTenant(user);
  if ("error" in scopedTenant) {
    return jsonResponse({ error: scopedTenant.error }, { status: scopedTenant.status });
  }

  const requestedTenantId = params?.tenantId;
  if (requestedTenantId && requestedTenantId !== scopedTenant.tenantId) {
    return jsonResponse({ error: "TenantId invalido para o escopo ativo" }, { status: 403 });
  }

  const { response, body } = await proxyBackend(
    `${getApiBase()}/billing/subscription/tenant/${scopedTenant.tenantId}`,
    {
      headers: buildHeaders(user, scopedTenant.tenantSlug),
      cache: "no-store",
    }
  );

  return forwardResponse(response.status, body);
}
