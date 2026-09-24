import { NextRequest } from "next/server";
import { buildHeaders, jsonResponse, proxyBackend, requireUser } from "@/app/api/_proxy/helpers";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autorizado" }, { status: 401 });
  }

  const id = (await context.params).id?.trim();
  if (!id) {
    return jsonResponse({ error: "Notificacao invalida" }, { status: 400 });
  }

  const baseUrl = getApiBase().replace(/\/+$/, "");
  const payload = await req.json().catch(() => ({}));
  const { response, body } = await proxyBackend(
    `${baseUrl}/profile/account-notifications/${encodeURIComponent(id)}/read`,
    {
      method: "PATCH",
      headers: buildHeaders(user, undefined, { includeContentType: true }),
      body: JSON.stringify(payload),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return jsonResponse(typeof body === "string" ? { error: body } : (body ?? { error: "Falha" }), {
      status: response.status,
    });
  }

  return jsonResponse(typeof body === "string" ? { data: body } : body);
}
