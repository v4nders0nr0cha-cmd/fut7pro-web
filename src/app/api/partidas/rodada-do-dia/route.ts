import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../../_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const targetUrl = new URL(`${getApiBase()}/api/partidas/rodada-do-dia`);
  const date = req.nextUrl.searchParams.get("date");
  if (date) targetUrl.searchParams.set("date", date);

  const { response, body } = await proxyBackend(targetUrl.toString(), {
    method: "GET",
    cache: "no-store",
    headers: buildHeaders(user, tenantSlug),
  });

  return forwardResponse(response.status, body);
}
