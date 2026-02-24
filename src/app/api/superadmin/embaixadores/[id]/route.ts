import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireSuperAdminUser,
} from "../../../_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE(_: Request, context: { params: { id: string } }) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const influencerId = String(context?.params?.id || "").trim();
  if (!influencerId) {
    return jsonResponse({ error: "Embaixador invalido" }, { status: 400 });
  }

  const { response, body } = await proxyBackend(
    `${getApiBase()}/superadmin/influencers/${encodeURIComponent(influencerId)}`,
    {
      method: "DELETE",
      headers: buildHeaders(user),
      cache: "no-store",
    }
  );

  return forwardResponse(response.status, body);
}
