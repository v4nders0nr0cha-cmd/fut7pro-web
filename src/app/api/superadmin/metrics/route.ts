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

type DashboardPayload = {
  userCount?: number;
  tenantCount?: number;
};

export async function GET(_req: NextRequest) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const { response, body } = await proxyBackend(`${getApiBase()}/superadmin/dashboard`, {
    headers: buildHeaders(user),
    cache: "no-store",
  });

  if (!response.ok) {
    return forwardResponse(response.status, body);
  }

  const payload = typeof body === "object" && body !== null ? (body as DashboardPayload) : {};

  return jsonResponse({
    totalRachas: payload.tenantCount ?? 0,
    totalUsuarios: payload.userCount ?? 0,
    receitaMensal: null,
  });
}
