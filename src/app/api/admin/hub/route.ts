import { proxyBackend, requireUser } from "../../_proxy/helpers";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Nao autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const baseUrl = getApiBase().replace(/\/+$/, "");
  const { response, body } = await proxyBackend(`${baseUrl}/admin/hub`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
    },
    cache: "no-store",
  });

  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
