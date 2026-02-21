import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import { blockLegacySuperAdminApiWhenDisabled } from "../../../_legacy-guard";
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

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  const blockedResponse = blockLegacySuperAdminApiWhenDisabled();
  if (blockedResponse) {
    return blockedResponse;
  }

  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const id = context.params.id;
  if (!id) {
    return jsonResponse({ error: "ID invalido" }, { status: 400 });
  }

  const body = await req.text();
  const { response, body: backendBody } = await proxyBackend(
    `${getApiBase()}/superadmin/suggestions/${id}/status`,
    {
      method: "PATCH",
      headers: buildHeaders(user, undefined, { includeContentType: true }),
      body,
    }
  );

  return forwardResponse(response.status, backendBody);
}
