import { getApiBase } from "@/lib/get-api-base";
import {
  requireUser,
  jsonResponse,
  proxyBackend,
  buildHeaders,
  forwardResponse,
} from "@/app/api/_proxy/helpers";
import { resolveScopedTenant } from "../subscription/_scope";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET() {
  const user = await requireUser();
  if (!user) return jsonResponse({ error: "Não autenticado" }, { status: 401 });
  const scope = await resolveScopedTenant(user);
  if ("error" in scope) return jsonResponse({ error: scope.error }, { status: scope.status });
  const { response, body } = await proxyBackend(`${getApiBase()}/billing/capabilities`, {
    headers: buildHeaders(user, scope.tenantSlug),
    cache: "no-store",
  });
  return forwardResponse(response.status, body);
}
