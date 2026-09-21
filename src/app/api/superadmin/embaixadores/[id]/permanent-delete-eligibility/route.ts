import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireSuperAdminUser,
} from "../../../../_proxy/helpers";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const user = await requireSuperAdminUser();
  if (!user) return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  const { response, body } = await proxyBackend(
    `${getApiBase()}/superadmin/influencers/${encodeURIComponent(params.id)}/permanent-delete-eligibility`,
    {
      headers: buildHeaders(user),
      cache: "no-store",
    }
  );
  return forwardResponse(response.status, body);
}
