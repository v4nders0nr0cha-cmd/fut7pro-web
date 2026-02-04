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
export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id?: string } }) {
  const user = await requireSuperAdminUser();
  if (!user) return jsonResponse({ error: "Nao autenticado" }, { status: 401 });

  const id = params?.id;
  if (!id) return jsonResponse({ error: "ID obrigatorio" }, { status: 400 });

  const targetUrl = `${getApiBase()}/superadmin/users/${encodeURIComponent(id)}/revoke`;
  const body = await req.text();
  const { response, body: backendBody } = await proxyBackend(targetUrl, {
    method: "POST",
    headers: buildHeaders(user, undefined, { includeContentType: true }),
    body,
  });

  return forwardResponse(response.status, backendBody);
}
