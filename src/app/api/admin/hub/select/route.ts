import { NextRequest, NextResponse } from "next/server";
import { buildHeaders, proxyBackend, requireUser } from "../../../_proxy/helpers";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIVE_TENANT_COOKIE = "fut7pro_active_tenant";

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";

  if (!slug) {
    return NextResponse.json({ error: "Slug invalido" }, { status: 400 });
  }

  const baseUrl = getApiBase().replace(/\/+$/, "");
  const { response, body: accessBody } = await proxyBackend(`${baseUrl}/admin/access`, {
    method: "GET",
    headers: {
      ...buildHeaders(user, slug),
      "x-auth-context": "admin",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      typeof accessBody === "string" ? { error: accessBody } : (accessBody ?? { error: "Falha" }),
      { status: response.status }
    );
  }

  const blocked = Boolean((accessBody as any)?.blocked);
  const redirectTo = blocked ? "/admin/status-assinatura" : "/admin/dashboard";

  const res = NextResponse.json({ redirectTo, blocked });
  res.cookies.set(ACTIVE_TENANT_COOKIE, slug, { path: "/", sameSite: "lax" });
  return res;
}
