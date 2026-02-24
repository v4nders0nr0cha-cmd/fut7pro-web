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
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const influencerId = String(context?.params?.id || "").trim();
  if (!influencerId) {
    return jsonResponse({ error: "Embaixador invalido" }, { status: 400 });
  }

  const payload = (await request.json().catch(() => ({}))) as {
    status?: "ATIVO" | "BLOQUEADO";
  };

  if (payload.status !== "ATIVO" && payload.status !== "BLOQUEADO") {
    return jsonResponse({ error: "Status invalido" }, { status: 400 });
  }

  const { response, body } = await proxyBackend(
    `${getApiBase()}/superadmin/influencers/${encodeURIComponent(influencerId)}/status`,
    {
      method: "PATCH",
      headers: buildHeaders(user, undefined, { includeContentType: true }),
      body: JSON.stringify({
        status: payload.status,
      }),
      cache: "no-store",
    }
  );

  return forwardResponse(response.status, body);
}
