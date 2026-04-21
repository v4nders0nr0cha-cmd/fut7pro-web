import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireSuperAdminUser,
} from "../../../../_proxy/helpers";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

function mapRelationship(item: any) {
  return {
    id: item?.id ?? "",
    type: item?.type ?? "MEMBERSHIP",
    label: item?.label ?? undefined,
    role: item?.role ?? undefined,
    status: item?.status ?? undefined,
    tenantId: item?.tenantId ?? undefined,
    tenantSlug: item?.tenantSlug ?? undefined,
    tenantNome: item?.tenantName ?? undefined,
    blocksDeletion: Boolean(item?.blocksDeletion),
    unlinkable: item?.unlinkable !== false,
    unlinkRequiresTransfer: Boolean(item?.unlinkRequiresTransfer),
    unlinkBlockedReason: item?.unlinkBlockedReason ?? undefined,
  };
}

export async function GET(_req: NextRequest, { params }: { params: { id?: string } }) {
  const user = await requireSuperAdminUser();
  if (!user) return jsonResponse({ error: "Nao autenticado" }, { status: 401 });

  const id = params?.id;
  if (!id) return jsonResponse({ error: "ID obrigatorio" }, { status: 400 });

  const targetUrl = `${getApiBase()}/superadmin/users/${encodeURIComponent(id)}/relationships`;
  const { response, body } = await proxyBackend(targetUrl, {
    headers: buildHeaders(user),
    cache: "no-store",
  });

  if (!response.ok) {
    return forwardResponse(response.status, body);
  }

  const payload = (body as Record<string, any>) || {};

  return jsonResponse({
    user: payload.user ?? null,
    eligibleForDeletion: Boolean(payload.eligibleForDeletion),
    reasons: Array.isArray(payload.reasons) ? payload.reasons : [],
    summary: payload.summary ?? null,
    linkedTenants: Array.isArray(payload.linkedTenants)
      ? payload.linkedTenants.map((tenant) => ({
          tenantId: tenant?.tenantId ?? undefined,
          tenantSlug: tenant?.tenantSlug ?? undefined,
          tenantNome: tenant?.tenantName ?? undefined,
        }))
      : [],
    relationships: Array.isArray(payload.relationships)
      ? payload.relationships.map((item) => mapRelationship(item))
      : [],
  });
}
