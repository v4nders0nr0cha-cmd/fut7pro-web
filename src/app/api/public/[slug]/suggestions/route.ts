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
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: NextRequest, context: { params: { slug: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const slug = context.params.slug?.trim().toLowerCase();
  if (!slug) {
    return jsonResponse({ error: "Slug invalido" }, { status: 400 });
  }

  const headers = buildHeaders(user, slug);
  headers["x-auth-context"] = "athlete";

  const { response, body } = await proxyBackend(`${getApiBase()}/public/suggestions/mine`, {
    headers,
    cache: "no-store",
  });

  return forwardResponse(response.status, body);
}

export async function POST(req: NextRequest, context: { params: { slug: string } }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const slug = context.params.slug?.trim().toLowerCase();
  if (!slug) {
    return jsonResponse({ error: "Slug invalido" }, { status: 400 });
  }

  const body = await req.text();
  const headers = buildHeaders(user, slug, { includeContentType: true });
  headers["x-auth-context"] = "athlete";

  const { response, body: backendBody } = await proxyBackend(`${getApiBase()}/public/suggestions`, {
    method: "POST",
    headers,
    body,
  });

  return forwardResponse(response.status, backendBody);
}
