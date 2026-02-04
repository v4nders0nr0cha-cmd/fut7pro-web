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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id?: string; userId?: string } }
) {
  const user = await requireSuperAdminUser();
  if (!user) return jsonResponse({ error: "Nao autenticado" }, { status: 401 });

  const tenantId = params?.id;
  const userId = params?.userId;
  if (!tenantId || !userId) {
    return jsonResponse({ error: "ID obrigatorio" }, { status: 400 });
  }

  const targetUrl = `${getApiBase()}/superadmin/tenants/${encodeURIComponent(
    tenantId
  )}/admins/${encodeURIComponent(userId)}`;
  const { response, body } = await proxyBackend(targetUrl, {
    method: "DELETE",
    headers: buildHeaders(user),
  });

  return forwardResponse(response.status, body);
}
