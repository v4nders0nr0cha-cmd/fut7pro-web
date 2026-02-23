import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireSuperAdminUser,
} from "../../_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const { response, body } = await proxyBackend(
    `${getApiBase()}/superadmin/influencers/dashboard`,
    {
      headers: buildHeaders(user),
      cache: "no-store",
    }
  );

  return forwardResponse(response.status, body);
}
