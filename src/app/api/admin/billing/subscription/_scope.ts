import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../../../_proxy/helpers";

type AuthUser = NonNullable<Awaited<ReturnType<typeof requireUser>>>;

export type ScopedTenantResult =
  | { tenantId: string; tenantSlug: string }
  | { error: string; status: number };

export async function resolveScopedTenant(user: AuthUser): Promise<ScopedTenantResult> {
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

export async function ensureScopedSubscription(
  user: AuthUser,
  subscriptionId: string
): Promise<{ tenantSlug: string } | { error: string; status: number }> {
  const scopedTenant = await resolveScopedTenant(user);
  if ("error" in scopedTenant) {
    return scopedTenant;
  }

  const { response, body } = await proxyBackend(
    `${getApiBase()}/billing/subscription/tenant/${scopedTenant.tenantId}`,
    {
      headers: buildHeaders(user, scopedTenant.tenantSlug),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return {
      error: "Nao foi possivel validar a assinatura do tenant ativo",
      status: response.status,
    };
  }

  const scopedSubscriptionId =
    typeof (body as { id?: unknown } | null)?.id === "string" ? body.id : "";
  if (!scopedSubscriptionId) {
    return { error: "Assinatura nao encontrada para o tenant ativo", status: 404 };
  }

  if (scopedSubscriptionId !== subscriptionId) {
    return { error: "Assinatura fora do escopo do tenant ativo", status: 403 };
  }

  return { tenantSlug: scopedTenant.tenantSlug };
}
