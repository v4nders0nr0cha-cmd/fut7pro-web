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
export const revalidate = 0;
export const dynamic = "force-dynamic";

async function resolveScopedTenant(
  user: NonNullable<Awaited<ReturnType<typeof requireUser>>>
): Promise<{ tenantId: string; tenantSlug: string } | { error: string; status: number }> {
  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return { error: "Slug do racha obrigatorio", status: 400 };
  }

  const baseUrl = getApiBase().replace(/\/+$/, "");
  const { response, body } = await proxyBackend(`${baseUrl}/admin/access`, {
    method: "GET",
    headers: {
      ...buildHeaders(user, tenantSlug),
      "x-auth-context": "admin",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return { error: "Nao foi possivel validar o tenant ativo", status: response.status };
  }

  const tenantId =
    typeof (body as { tenant?: { id?: unknown; tenantId?: unknown } } | null)?.tenant?.id ===
    "string"
      ? String((body as { tenant?: { id?: string } }).tenant?.id)
      : typeof (body as { tenant?: { tenantId?: unknown } } | null)?.tenant?.tenantId === "string"
        ? String((body as { tenant?: { tenantId?: string } }).tenant?.tenantId)
        : "";

  if (!tenantId) {
    return { error: "Tenant ativo nao identificado", status: 400 };
  }

  return { tenantId, tenantSlug };
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const payload = (await req.json().catch(() => null)) as {
    tenantId?: string;
    planKey?: string;
    payerEmail?: string;
    [key: string]: unknown;
  } | null;
  if (!payload || !payload.planKey || !payload.payerEmail) {
    return jsonResponse({ error: "Dados incompletos para assinatura" }, { status: 400 });
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

  const { response, body } = await proxyBackend(`${getApiBase()}/billing/subscription`, {
    method: "POST",
    headers: buildHeaders(user, scopedTenant.tenantSlug, { includeContentType: true }),
    body: JSON.stringify(safePayload),
  });

  return forwardResponse(response.status, body);
}
