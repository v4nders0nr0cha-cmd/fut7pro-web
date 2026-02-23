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

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const applicationId = String(context?.params?.id || "").trim();
  if (!applicationId) {
    return jsonResponse({ error: "Solicitacao invalida" }, { status: 400 });
  }

  const payload = (await request.json().catch(() => ({}))) as {
    status?: string;
    note?: string;
    coupon?: string;
  };

  if (!payload.status) {
    return jsonResponse({ error: "Status obrigatorio" }, { status: 400 });
  }

  const { response, body } = await proxyBackend(
    `${getApiBase()}/superadmin/influencers/applications/${encodeURIComponent(applicationId)}/status`,
    {
      method: "PATCH",
      headers: buildHeaders(user, undefined, { includeContentType: true }),
      body: JSON.stringify({
        status: payload.status,
        note: payload.note,
        coupon: payload.coupon,
      }),
      cache: "no-store",
    }
  );

  return forwardResponse(response.status, body);
}
