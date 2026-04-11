import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  appendSafeQueryParams,
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

  const target = new URL(`${getApiBase()}/superadmin/tenants/lifecycle`);
  appendSafeQueryParams(req.nextUrl.searchParams, target, {
    allowTenantKeys: false,
    allowedKeys: ["lifecyclestatus", "billingstatus", "conversionstatus", "includevitrine"],
  });

  const { response, body } = await proxyBackend(target.toString(), {
    headers: buildHeaders(user),
    cache: "no-store",
  });

  return forwardResponse(response.status, body);
}

export async function POST(_req: NextRequest) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const { response, body } = await proxyBackend(
    `${getApiBase()}/superadmin/tenants/lifecycle/reconcile`,
    {
      method: "POST",
      headers: buildHeaders(user),
      cache: "no-store",
    }
  );

  return forwardResponse(response.status, body);
}
