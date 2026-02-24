import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  appendSafeQueryParams,
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireSuperAdminUser,
} from "../../../_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const targetUrl = new URL(`${getApiBase()}/superadmin/blog/posts`);
  appendSafeQueryParams(req.nextUrl.searchParams, targetUrl, {
    allowedKeys: ["pageSize"],
  });

  const { response, body } = await proxyBackend(targetUrl.toString(), {
    headers: buildHeaders(user),
    cache: "no-store",
  });

  return forwardResponse(response.status, body);
}

export async function POST(req: NextRequest) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const { response, body } = await proxyBackend(`${getApiBase()}/superadmin/blog/posts`, {
    method: "POST",
    headers: buildHeaders(user, undefined, { includeContentType: true }),
    body: await req.text(),
  });

  return forwardResponse(response.status, body);
}
