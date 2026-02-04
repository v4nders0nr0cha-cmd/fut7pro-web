import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../../../../../_proxy/helpers";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const slugParam = searchParams.get("slug") || undefined;
  const tenantSlug = resolveTenantSlug(user, slugParam);

  const targetUrl = new URL(
    `${getApiBase()}/admin/rachas/${tenantSlug}/comunicacao/groups/preview`
  );
  const search = new URL(req.url).search;
  if (search) {
    targetUrl.search = search;
  }

  const { response, body } = await proxyBackend(targetUrl.toString(), {
    headers: buildHeaders(user, tenantSlug),
    cache: "no-store",
  });

  return forwardResponse(response.status, body);
}
