import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
} from "@/app/api/_proxy/helpers";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, context: { params: { slug: string; id: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const slug = context.params.slug;
  const id = context.params.id;
  if (!slug || !id) {
    return jsonResponse({ error: "Parametros invalidos" }, { status: 400 });
  }

  const targetUrl = `${getApiBase()}/public/rachas/${slug}/notifications/${id}/read`;
  const headers = buildHeaders(user, slug, { includeContentType: true });
  headers["x-auth-context"] = "athlete";

  const { response, body } = await proxyBackend(targetUrl, {
    method: "PATCH",
    headers,
  });

  return forwardResponse(response.status, body);
}
