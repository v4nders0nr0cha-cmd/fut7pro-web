import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "@/app/api/_proxy/helpers";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { tenantId: string } }) {
  const user = await requireUser();
  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const payload = await req.json();
  const base = getApiBase();
  const requestTenantSlug = req.headers.get("x-tenant-slug") || undefined;
  const tenantSlug = resolveTenantSlug(user, requestTenantSlug);
  const headers = buildHeaders(user, tenantSlug, {
    includeContentType: true,
  });

  const scopeProbe = await proxyBackend(`${base}/me`, {
    method: "GET",
    headers: buildHeaders(user, tenantSlug),
    cache: "no-store",
  });

  if (!scopeProbe.response.ok) {
    return new Response(JSON.stringify({ error: "Nao foi possivel validar o tenant ativo" }), {
      status: scopeProbe.response.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const scopedTenantId =
    typeof (scopeProbe.body as { tenant?: { tenantId?: unknown; id?: unknown } } | null)?.tenant
      ?.tenantId === "string"
      ? String((scopeProbe.body as { tenant?: { tenantId?: string } }).tenant?.tenantId)
      : typeof (scopeProbe.body as { tenant?: { id?: unknown } } | null)?.tenant?.id === "string"
        ? String((scopeProbe.body as { tenant?: { id?: string } }).tenant?.id)
        : "";

  if (!scopedTenantId) {
    return new Response(JSON.stringify({ error: "Tenant ativo nao identificado" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (params.tenantId !== scopedTenantId) {
    return new Response(JSON.stringify({ error: "TenantId invalido para o escopo ativo" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { response, body } = await proxyBackend(
    `${base}/tenants/${encodeURIComponent(scopedTenantId)}/athletes/me`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload),
    }
  );

  return new Response(JSON.stringify(body), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
