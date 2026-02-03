import { NextRequest, NextResponse } from "next/server";
import { buildHeaders, proxyBackend, requireUser } from "../../../_proxy/helpers";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIVE_TENANT_COOKIE = "fut7pro_active_tenant";

type HubItem = {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  role: string;
  subscription?: {
    status?: "ATIVO" | "ALERTA" | "BLOQUEADO";
    blocked?: boolean;
  } | null;
};

export async function GET(_req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const baseUrl = getApiBase().replace(/\/+$/, "");
  const hubStart = Date.now();
  const { response: hubResponse, body: hubBody } = await proxyBackend(`${baseUrl}/admin/hub`, {
    method: "GET",
    headers: {
      ...buildHeaders(user),
      "x-auth-context": "admin",
    },
    cache: "no-store",
  });

  if (!hubResponse.ok) {
    return NextResponse.json(
      typeof hubBody === "string"
        ? { error: hubBody }
        : (hubBody ?? { error: "Falha ao carregar" }),
      { status: hubResponse.status }
    );
  }

  const items = Array.isArray(hubBody) ? (hubBody as HubItem[]) : [];
  const timing: { hubMs: number; accessMs?: number } = { hubMs: Date.now() - hubStart };

  if (items.length !== 1 || !items[0]?.tenantSlug) {
    return NextResponse.json({ items, count: items.length, redirectTo: null, timing });
  }

  const singleSlug = String(items[0].tenantSlug);
  const accessStart = Date.now();
  const { response: accessResponse, body: accessBody } = await proxyBackend(
    `${baseUrl}/admin/access`,
    {
      method: "GET",
      headers: {
        ...buildHeaders(user, singleSlug),
        "x-auth-context": "admin",
      },
      cache: "no-store",
    }
  );
  timing.accessMs = Date.now() - accessStart;

  if (!accessResponse.ok) {
    return NextResponse.json(
      typeof accessBody === "string"
        ? { error: accessBody, items, count: items.length, timing }
        : { ...(accessBody as object), items, count: items.length, timing },
      { status: accessResponse.status }
    );
  }

  const blocked = Boolean((accessBody as any)?.blocked);
  const redirectTo = blocked ? "/admin/status-assinatura" : "/admin/dashboard";

  const res = NextResponse.json({
    items,
    count: items.length,
    redirectTo,
    blocked,
    timing,
  });
  res.cookies.set(ACTIVE_TENANT_COOKIE, singleSlug, { path: "/", sameSite: "lax" });
  return res;
}
