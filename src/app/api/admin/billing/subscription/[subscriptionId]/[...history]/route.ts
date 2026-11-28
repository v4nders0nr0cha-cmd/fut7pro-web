import type { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  requireUser,
  jsonResponse,
  proxyBackend,
  buildHeaders,
  forwardResponse,
} from "@/app/api/_proxy/helpers";
import { ensureScopedSubscription } from "../../_scope";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ subscriptionId: string; history: string[] }> }
) {
  const user = await requireUser();
  if (!user) return jsonResponse({ error: "Não autenticado" }, { status: 401 });
  const { subscriptionId, history } = await props.params;
  if (
    !/^[a-zA-Z0-9_-]{1,200}$/.test(subscriptionId) ||
    !(
      (history.length === 1 &&
        ["overview", "benefits", "invoices", "events"].includes(history[0])) ||
      (history.length === 2 &&
        history[0] === "invoices" &&
        /^[a-zA-Z0-9_-]{1,200}$/.test(history[1]))
    )
  )
    return jsonResponse({ error: "Consulta não encontrada" }, { status: 404 });
  const scope = await ensureScopedSubscription(user, subscriptionId);
  if ("error" in scope) return jsonResponse({ error: scope.error }, { status: scope.status });
  const query = new URLSearchParams();
  for (const key of ["limit", "cursor", "status", "from", "to", "category", "eventType", "kind"]) {
    const value = req.nextUrl.searchParams.get(key);
    if (value !== null) query.set(key, value);
  }
  const url = `${getApiBase()}/billing/subscription/${encodeURIComponent(subscriptionId)}/${history.map(encodeURIComponent).join("/")}${query.size ? `?${query}` : ""}`;
  const { response, body } = await proxyBackend(url, {
    headers: buildHeaders(user, scope.tenantSlug),
    cache: "no-store",
  });
  return forwardResponse(response.status, body);
}

export async function POST(
  _req: NextRequest,
  props: { params: Promise<{ subscriptionId: string; history: string[] }> }
) {
  const user = await requireUser();
  if (!user) return jsonResponse({ error: "Não autenticado" }, { status: 401 });
  const { subscriptionId, history } = await props.params;
  if (
    !/^[a-zA-Z0-9_-]{1,200}$/.test(subscriptionId) ||
    history.length !== 3 ||
    history[0] !== "invoices" ||
    history[2] !== "reconcile" ||
    !/^[a-zA-Z0-9_-]{1,200}$/.test(history[1])
  )
    return jsonResponse({ error: "Operação não encontrada" }, { status: 404 });
  const scope = await ensureScopedSubscription(user, subscriptionId);
  if ("error" in scope) return jsonResponse({ error: scope.error }, { status: scope.status });
  const url = `${getApiBase()}/billing/subscription/${encodeURIComponent(subscriptionId)}/invoices/${encodeURIComponent(history[1])}/reconcile`;
  const { response, body } = await proxyBackend(url, {
    method: "POST",
    headers: buildHeaders(user, scope.tenantSlug),
    cache: "no-store",
  });
  return forwardResponse(response.status, body);
}
