import { buildHeaders, jsonResponse, proxyBackend, requireUser } from "@/app/api/_proxy/helpers";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autorizado" }, { status: 401 });
  }

  const baseUrl = getApiBase().replace(/\/+$/, "");
  const { response, body } = await proxyBackend(`${baseUrl}/profile/security/recovery`, {
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
