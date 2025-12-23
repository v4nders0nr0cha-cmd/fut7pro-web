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
  const headers = buildHeaders(user, resolveTenantSlug(user, requestTenantSlug), {
    includeContentType: true,
  });

  const { response, body } = await proxyBackend(
    `${base}/tenants/${encodeURIComponent(params.tenantId)}/athletes/me`,
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
