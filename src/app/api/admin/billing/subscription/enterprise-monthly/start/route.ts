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

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const payload = (await req.json().catch(() => null)) as {
    tenantId?: string;
    payerEmail?: string;
    payerName?: string;
    [key: string]: unknown;
  } | null;
  if (!payload || !payload.payerEmail || !payload.payerName) {
    return jsonResponse({ error: "Dados incompletos para enterprise monthly" }, { status: 400 });
  }

  const scopedTenant = await resolveScopedTenant(user);
  if ("error" in scopedTenant) {
    return jsonResponse({ error: scopedTenant.error }, { status: scopedTenant.status });
  }

  if (payload.tenantId && payload.tenantId !== scopedTenant.tenantId) {
    return jsonResponse({ error: "TenantId invalido para o escopo ativo" }, { status: 403 });
  }

  const safePayload = {
    ...payload,
    tenantId: scopedTenant.tenantId,
  };

  const { response, body } = await proxyBackend(
    `${getApiBase()}/billing/subscription/enterprise-monthly/start`,
    {
      method: "POST",
      headers: buildHeaders(user, scopedTenant.tenantSlug, { includeContentType: true }),
      body: JSON.stringify(safePayload),
    }
  );

  return forwardResponse(response.status, body);
}
