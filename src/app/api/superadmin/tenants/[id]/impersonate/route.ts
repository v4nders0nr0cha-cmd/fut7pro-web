import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
} from "../../../../_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest, { params }: { params: { id?: string } }) {
  const user = await requireUser();
  if (!user) return jsonResponse({ error: "Nao autenticado" }, { status: 401 });

  const id = params?.id;
  if (!id) return jsonResponse({ error: "ID obrigatorio" }, { status: 400 });

  const targetUrl = `${getApiBase()}/superadmin/tenants/${encodeURIComponent(id)}/impersonate`;
  const { response, body } = await proxyBackend(targetUrl, {
    method: "POST",
    headers: buildHeaders(user, undefined, { includeContentType: true }),
    body: await req.text(),
  });

  return forwardResponse(response.status, body);
}
