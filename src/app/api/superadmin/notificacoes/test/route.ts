import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireSuperAdminUser,
  resolveTenantSlug,
} from "../../../_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function extractTenantSlugFromBody(body: string): string | undefined {
  try {
    const payload = JSON.parse(body) as { tenantSlug?: string; slug?: string };
    if (typeof payload.tenantSlug === "string" && payload.tenantSlug.trim()) {
      return payload.tenantSlug.trim();
    }
    if (typeof payload.slug === "string" && payload.slug.trim()) {
      return payload.slug.trim();
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export async function POST(req: NextRequest) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const body = await req.text();
  const tenantSlug = resolveTenantSlug(
    user,
    extractTenantSlugFromBody(body) ?? req.nextUrl.searchParams.get("tenantSlug") ?? undefined
  );
  const targetUrl = `${getApiBase()}/superadmin/notificacoes/test`;

  const { response, body: backendBody } = await proxyBackend(targetUrl, {
    method: "POST",
    headers: buildHeaders(user, tenantSlug ?? undefined, { includeContentType: true }),
    body,
  });

  return forwardResponse(response.status, backendBody);
}
