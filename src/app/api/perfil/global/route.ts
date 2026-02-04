import { NextRequest } from "next/server";
import { buildHeaders, jsonResponse, proxyBackend, requireUser } from "../../_proxy/helpers";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autorizado" }, { status: 401 });
  }

  const baseUrl = getApiBase().replace(/\/+$/, "");
  const { response, body } = await proxyBackend(`${baseUrl}/profile/global`, {
    method: "GET",
    headers: buildHeaders(user),
    cache: "no-store",
  });

  if (!response.ok) {
    return jsonResponse(typeof body === "string" ? { error: body } : (body ?? { error: "Falha" }), {
      status: response.status,
    });
  }

  return jsonResponse(typeof body === "string" ? { data: body } : body);
}

export async function PATCH(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autorizado" }, { status: 401 });
  }

  const payload = await req.json().catch(() => null);
  const baseUrl = getApiBase().replace(/\/+$/, "");
  const { response, body } = await proxyBackend(`${baseUrl}/profile/global`, {
    method: "PATCH",
    headers: buildHeaders(user, undefined, { includeContentType: true }),
    body: JSON.stringify(payload ?? {}),
    cache: "no-store",
  });

  if (!response.ok) {
    return jsonResponse(typeof body === "string" ? { error: body } : (body ?? { error: "Falha" }), {
      status: response.status,
    });
  }

  return jsonResponse(typeof body === "string" ? { data: body } : body);
}
