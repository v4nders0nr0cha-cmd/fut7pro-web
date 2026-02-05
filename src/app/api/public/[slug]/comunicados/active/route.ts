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

export async function GET(_req: NextRequest, context: { params: { slug: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const slug = context.params.slug;
  if (!slug) {
    return jsonResponse({ error: "Slug invalido" }, { status: 400 });
  }

  const targetUrl = `${getApiBase()}/public/rachas/${slug}/comunicados/active`;
  const headers = buildHeaders(user, slug);
  headers["x-auth-context"] = "athlete";

  const { response, body } = await proxyBackend(targetUrl, {
    headers,
    cache: "no-store",
  });

  return forwardResponse(response.status, body);
}
