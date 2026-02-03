import { NextRequest } from "next/server";
import { buildHeaders, proxyBackend, requireUser, resolveTenantSlug } from "../../_proxy/helpers";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Nao autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const slugParam = req.nextUrl.searchParams.get("slug") || undefined;
  const tenantSlug = resolveTenantSlug(user, slugParam);
  if (!tenantSlug) {
    return new Response(JSON.stringify({ error: "Tenant nao identificado" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const baseUrl = getApiBase().replace(/\/+$/, "");
  const { response, body } = await proxyBackend(`${baseUrl}/admin/access`, {
    method: "GET",
    headers: {
      ...buildHeaders(user, tenantSlug),
      "x-auth-context": "admin",
    },
    cache: "no-store",
  });

  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
