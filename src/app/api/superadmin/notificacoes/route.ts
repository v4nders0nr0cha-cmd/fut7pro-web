import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireSuperAdminUser,
} from "../../_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const params = req.nextUrl.searchParams.toString();
  const targetUrl = `${getApiBase()}/superadmin/notificacoes${params ? `?${params}` : ""}`;

  const { response, body } = await proxyBackend(targetUrl, {
    headers: buildHeaders(user),
    cache: "no-store",
  });

  const proxied = forwardResponse(response.status, body);
  proxied.headers.set("Cache-Control", "no-store, max-age=0");
  return proxied;
}

export async function POST(req: NextRequest) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const body = await req.text();
  const targetUrl = `${getApiBase()}/superadmin/notificacoes`;

  const { response, body: backendBody } = await proxyBackend(targetUrl, {
    method: "POST",
    headers: buildHeaders(user, undefined, { includeContentType: true }),
    body,
  });

  const proxied = forwardResponse(response.status, backendBody);
  proxied.headers.set("Cache-Control", "no-store, max-age=0");
  return proxied;
}
