import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import { blockLegacySuperAdminApiWhenDisabled } from "../_legacy-guard";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireSuperAdminUser,
} from "../../_proxy/helpers";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const blockedResponse = blockLegacySuperAdminApiWhenDisabled();
  if (blockedResponse) {
    return blockedResponse;
  }

  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const { response, body } = await proxyBackend(`${getApiBase()}/superadmin/integracoes`, {
    headers: buildHeaders(user),
    cache: "no-store",
  });

  return forwardResponse(response.status, body);
}
