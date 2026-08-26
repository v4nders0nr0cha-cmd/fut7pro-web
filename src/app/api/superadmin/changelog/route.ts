import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
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

export async function GET(req: NextRequest) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const search = req.nextUrl.search || "";
  const { response, body } = await proxyBackend(`${getApiBase()}/superadmin/changelog${search}`, {
    headers: buildHeaders(user),
    cache: "no-store",
  });

  return forwardResponse(response.status, body);
}
