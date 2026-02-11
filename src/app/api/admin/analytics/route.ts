import { NextRequest } from "next/server";
import { buildHeaders, proxyBackend, requireUser, resolveTenantSlug } from "../../_proxy/helpers";

export const runtime = "nodejs";

const ALLOWED_PERIODS = new Set(["week", "month", "quarter", "year"]);

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Nao autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const searchParams = req.nextUrl.searchParams;
  const rawPeriod = (searchParams.get("period") || "week").toLowerCase();
  const period = ALLOWED_PERIODS.has(rawPeriod) ? rawPeriod : "week";
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return new Response(JSON.stringify({ error: "Tenant nao identificado" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const baseUrl =
    process.env.BACKEND_URL ||
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://api.fut7pro.com.br";

  const url = new URL("/admin/analytics/overview", baseUrl);
  url.searchParams.set("period", period);
  if (from) url.searchParams.set("from", from);
  if (to) url.searchParams.set("to", to);

  const { response, body } = await proxyBackend(url.toString(), {
    method: "GET",
    headers: buildHeaders(user, tenantSlug),
    cache: "no-store",
  });

  if (!response.ok) {
    return new Response(
      JSON.stringify({
        error: "Falha ao buscar analytics",
        status: response.status,
        body,
      }),
      {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
