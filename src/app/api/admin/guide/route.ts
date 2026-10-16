import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../../_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const ACTION_FIELDS: Record<string, string[]> = {
  WELCOME_SEEN: [],
  PUBLIC_SITE_OPENED: [],
  TIP_KNOWN: ["tipId"],
  TIP_DISMISSED: ["tipId"],
  TIP_SNOOZED: ["tipId", "snoozedUntil"],
  FIRST_MATCH_MODE_SELECTED: ["mode"],
  MONTHLY_MODEL_SELECTED: ["monthlyModel"],
  RESOURCE_VIEWED: ["resourceId"],
};

async function context() {
  const user = await requireUser({ scope: "admin" });
  if (!user) return { response: jsonResponse({ message: "Não autenticado." }, { status: 401 }) };
  const slug = resolveTenantSlug(user);
  if (!slug)
    return {
      response: jsonResponse({ message: "Pelada ativa não identificada." }, { status: 400 }),
    };
  return { headers: buildHeaders(user, slug) };
}

export async function GET() {
  const current = await context();
  if (current.response) return current.response;
  const { response, body } = await proxyBackend(`${getApiBase()}/api/admin/guide`, {
    method: "GET",
    headers: current.headers,
    cache: "no-store",
  });
  return forwardResponse(response.status, body);
}

export async function PATCH(request: NextRequest) {
  const current = await context();
  if (current.response) return current.response;
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return jsonResponse({ message: "Ação do Guia inválida." }, { status: 400 });
  }
  const action = (payload as Record<string, unknown>).action;
  if (typeof action !== "string" || !ACTION_FIELDS[action]) {
    return jsonResponse({ message: "Ação do Guia inválida." }, { status: 400 });
  }
  const allowed = new Set(["action", "expectedRevision", ...ACTION_FIELDS[action]]);
  if (Object.keys(payload).some((key) => !allowed.has(key))) {
    return jsonResponse({ message: "Campos não permitidos nesta ação." }, { status: 400 });
  }
  const { response, body } = await proxyBackend(`${getApiBase()}/api/admin/guide`, {
    method: "PATCH",
    headers: { ...current.headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  return forwardResponse(response.status, body);
}
