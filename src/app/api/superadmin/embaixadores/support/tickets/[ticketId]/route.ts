import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireSuperAdminUser,
} from "../../../../../_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ ticketId: string }> }
) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const params = await context.params;
  const ticketId = String(params?.ticketId || "").trim();
  if (!ticketId) {
    return jsonResponse({ error: "ticketId invalido" }, { status: 400 });
  }

  const body = await request.text();
  const { response, body: backendBody } = await proxyBackend(
    `${getApiBase()}/superadmin/influencers/support/tickets/${encodeURIComponent(ticketId)}`,
    {
      method: "PATCH",
      headers: buildHeaders(user, undefined, { includeContentType: true }),
      body,
      cache: "no-store",
    }
  );

  return forwardResponse(response.status, backendBody);
}
