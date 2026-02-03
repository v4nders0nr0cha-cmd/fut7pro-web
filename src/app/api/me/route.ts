import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "@/app/api/_proxy/helpers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await requireUser();
  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slugParam = searchParams.get("slug")?.trim().toLowerCase() || null;
  const contextParam = searchParams.get("context")?.trim().toLowerCase() || null;
  const authContext =
    contextParam === "athlete" ? "athlete" : contextParam === "admin" ? "admin" : null;

  const base = getApiBase();
  const headers = buildHeaders(user, resolveTenantSlug(user, slugParam || undefined), {
    includeContentType: false,
  });
  if (authContext) {
    headers["x-auth-context"] = authContext;
  }
  const { response, body } = await proxyBackend(`${base}/me`, { headers });

  return new Response(JSON.stringify(body), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
