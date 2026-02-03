import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireSuperAdminUser,
} from "../../../_proxy/helpers";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const search = req.nextUrl.searchParams.toString();
  const target = `${getApiBase()}/superadmin/metrics/locations${search ? `?${search}` : ""}`;
  const { response, body } = await proxyBackend(target, {
    headers: buildHeaders(user),
    cache: "no-store",
  });

  if (!response.ok) {
    return forwardResponse(response.status, body);
  }

  return jsonResponse(typeof body === "object" && body !== null ? (body as object) : {});
}
