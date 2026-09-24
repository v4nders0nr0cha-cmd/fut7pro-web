import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireSuperAdminUser,
} from "../../../../_proxy/helpers";

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await requireSuperAdminUser();
  if (!user) return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  const payload = (await request.json().catch(() => ({}))) as {
    confirmation?: string;
    reason?: string;
  };
  const { response, body } = await proxyBackend(
    `${getApiBase()}/superadmin/influencers/${encodeURIComponent(params.id)}/permanent`,
    {
      method: "DELETE",
      headers: buildHeaders(user, undefined, { includeContentType: true }),
      body: JSON.stringify({
        confirmation: String(payload.confirmation || ""),
        reason: String(payload.reason || ""),
      }),
      cache: "no-store",
    }
  );
  return forwardResponse(response.status, body);
}
