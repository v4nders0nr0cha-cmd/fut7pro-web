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

export async function GET(req: NextRequest, context: { params: { slug: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Não autenticado" }, { status: 401 });
  }

  const slug = context.params.slug;
  if (!slug) {
    return jsonResponse({ error: "Slug inválido" }, { status: 400 });
  }

  const targetUrl = new URL(`${getApiBase()}/public/rachas/${slug}/enquetes`);
  const search = new URL(req.url).search;
  if (search) {
    targetUrl.search = search;
  }

  const headers = buildHeaders(user, slug);
  headers["x-auth-context"] = "athlete";

  const { response, body } = await proxyBackend(targetUrl.toString(), {
    headers,
    cache: "no-store",
  });

  return forwardResponse(response.status, body);
}
