import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "@/app/api/_proxy/helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const base = getApiBase();
  const headers = buildHeaders(user, resolveTenantSlug(user), { includeContentType: false });
  const { response, body } = await proxyBackend(`${base}/me`, { headers });

  return new Response(JSON.stringify(body), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
