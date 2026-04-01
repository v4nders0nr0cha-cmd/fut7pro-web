import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireSuperAdminUser,
  resolveTenantSlug,
} from "../../../../_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest, { params }: { params: { id?: string } }) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(
    user,
    req.nextUrl.searchParams.get("tenantSlug") ?? undefined
  );
  const id = params?.id;
  if (!id) {
    return jsonResponse({ error: "ID obrigatorio" }, { status: 400 });
  }

  const targetUrl = `${getApiBase()}/superadmin/notificacoes/${encodeURIComponent(id)}/resend`;
  const { response, body } = await proxyBackend(targetUrl, {
    method: "POST",
    headers: buildHeaders(user, tenantSlug ?? undefined, { includeContentType: true }),
    body: "{}",
  });

  return forwardResponse(response.status, body);
}
