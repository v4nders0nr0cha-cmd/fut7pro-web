import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
} from "../../../../../_proxy/helpers";
import { ensureScopedSubscription } from "../../_scope";

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

  const scopedSubscription = await ensureScopedSubscription(user, subscriptionId);
  if ("error" in scopedSubscription) {
    return jsonResponse({ error: scopedSubscription.error }, { status: scopedSubscription.status });
  }

  const { response, body } = await proxyBackend(
    `${getApiBase()}/billing/subscription/${subscriptionId}/cancel`,
    {
      method: "POST",
      headers: buildHeaders(user, scopedSubscription.tenantSlug),
    }
  );

  return forwardResponse(response.status, body);
}
