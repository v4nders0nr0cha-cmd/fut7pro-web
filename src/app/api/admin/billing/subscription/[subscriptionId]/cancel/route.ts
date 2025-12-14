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

export async function POST(_req: NextRequest, { params }: { params: { subscriptionId?: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const subscriptionId = params?.subscriptionId;
  if (!subscriptionId) {
    return jsonResponse({ error: "subscriptionId obrigatorio" }, { status: 400 });
  }

  const tenantSlug = resolveTenantSlug(user);
  const { response, body } = await proxyBackend(
    `${getApiBase()}/billing/subscription/${subscriptionId}/cancel`,
    {
      method: "POST",
      headers: buildHeaders(user, tenantSlug),
    }
  );

  return forwardResponse(response.status, body);
}
