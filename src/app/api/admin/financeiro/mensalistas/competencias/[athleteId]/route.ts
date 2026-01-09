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

const BASE_PATH = "/financeiro/mensalistas/competencias";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH(req: NextRequest, { params }: { params: { athleteId: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const rawBody = await req.text();
  const tenantSlug = resolveTenantSlug(user);
  const targetUrl = new URL(`${getApiBase()}${BASE_PATH}/${encodeURIComponent(params.athleteId)}`);

  const { response, body } = await proxyBackend(targetUrl.toString(), {
    method: "PATCH",
    headers: buildHeaders(user, tenantSlug, { includeContentType: true }),
    body: rawBody,
  });

  return forwardResponse(response.status, body);
}
