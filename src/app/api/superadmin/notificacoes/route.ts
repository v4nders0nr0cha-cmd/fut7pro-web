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

function shouldReturnEmptyCampaignList(status: number, body: unknown) {
  if (status < 500) return false;
  const text =
    typeof body === "string"
      ? body
      : typeof body === "object" && body
        ? JSON.stringify(body)
        : "";
  const normalized = text.toLowerCase();
  return (
    normalized.includes("notificationcampaign") ||
    normalized.includes("createdby") ||
    normalized.includes("createdbyid") ||
    normalized.includes("p2021") ||
    normalized.includes("p2022") ||
    normalized.includes("does not exist")
  );
}

export async function GET(req: NextRequest) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const params = req.nextUrl.searchParams.toString();
  const targetUrl = `${getApiBase()}/superadmin/notificacoes${params ? `?${params}` : ""}`;

  const { response, body } = await proxyBackend(targetUrl, {
    headers: buildHeaders(user, undefined, { includeTenantHeaders: false }),
    cache: "no-store",
  });

  if (shouldReturnEmptyCampaignList(response.status, body)) {
    const fallback = forwardResponse(200, []);
    fallback.headers.set("Cache-Control", "no-store, max-age=0");
    fallback.headers.set("x-notificacoes-fallback", "legacy-schema");
    return fallback;
  }

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
    headers: buildHeaders(user, undefined, {
      includeContentType: true,
      includeTenantHeaders: false,
    }),
    body,
  });

  const proxied = forwardResponse(response.status, backendBody);
  proxied.headers.set("Cache-Control", "no-store, max-age=0");
  return proxied;
}
