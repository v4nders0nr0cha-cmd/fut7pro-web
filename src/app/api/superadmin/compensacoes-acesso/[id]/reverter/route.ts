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

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const headers = buildHeaders(user, undefined, { includeContentType: true });
  delete headers["x-tenant-id"];
  delete headers["x-tenant-slug"];

  const body = await req.text();
  const id = encodeURIComponent(params.id);
  const targetUrl = `${getApiBase()}/superadmin/compensacoes-acesso/${id}/reverter`;
  const { response, body: backendBody } = await proxyBackend(targetUrl, {
    method: "POST",
    headers,
    body,
  });

  return forwardResponse(response.status, backendBody);
}
