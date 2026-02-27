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

export async function POST(req: NextRequest) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const formData = await req.formData();
  const headers = buildHeaders(user);

  const { response, body } = await proxyBackend(`${getApiBase()}/superadmin/blog/assets/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  return forwardResponse(response.status, body);
}
