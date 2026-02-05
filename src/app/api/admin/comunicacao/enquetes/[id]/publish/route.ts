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

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Não autenticado" }, { status: 401 });
  }

  const id = context.params.id;
  if (!id) {
    return jsonResponse({ error: "ID inválido" }, { status: 400 });
  }

  const payload = await req.json().catch(() => null);
  if (!payload) {
    return jsonResponse({ error: "Payload inválido" }, { status: 400 });
  }

  const searchParams = req.nextUrl.searchParams;
  const slugParam = searchParams.get("slug") || undefined;
  const tenantSlug = resolveTenantSlug(user, slugParam);

  const { response, body } = await proxyBackend(
    `${getApiBase()}/admin/rachas/${tenantSlug}/comunicacao/enquetes/${id}/publish`,
    {
      method: "POST",
      headers: buildHeaders(user, tenantSlug, { includeContentType: true }),
      body: JSON.stringify(payload),
    }
  );

  return forwardResponse(response.status, body);
}
