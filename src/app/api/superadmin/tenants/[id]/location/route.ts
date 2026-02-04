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

export async function PUT(req: NextRequest, { params }: { params: { id?: string } }) {
  const user = await requireSuperAdminUser();
  if (!user) return jsonResponse({ error: "Nao autenticado" }, { status: 401 });

  const id = params?.id;
  if (!id) return jsonResponse({ error: "ID obrigatorio" }, { status: 400 });

  const body = await req.text();
  const targetUrl = `${getApiBase()}/superadmin/tenants/${encodeURIComponent(id)}/location`;

  const { response, body: backendBody } = await proxyBackend(targetUrl, {
    method: "PUT",
    headers: buildHeaders(user, undefined, { includeContentType: true }),
    body,
  });

  return forwardResponse(response.status, backendBody);
}
