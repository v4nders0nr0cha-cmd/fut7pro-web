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
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(_req: NextRequest) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const payload: { refreshToken?: string } = {};
  if (typeof user.refreshToken === "string" && user.refreshToken.trim().length > 0) {
    payload.refreshToken = user.refreshToken.trim();
  }
  const body = JSON.stringify(payload);

  const { response, body: backendBody } = await proxyBackend(`${getApiBase()}/auth/logout`, {
    method: "POST",
    headers: buildHeaders(user, undefined, { includeContentType: true }),
    body,
    cache: "no-store",
  });

  return forwardResponse(response.status, backendBody);
}
