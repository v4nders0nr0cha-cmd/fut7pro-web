import { NextRequest, NextResponse } from "next/server";
import { buildHeaders, proxyBackend, requireUser } from "../../_proxy/helpers";
import { getApiBase } from "@/lib/get-api-base";
import {
  ADMIN_ACTIVE_TENANT_COOKIE,
  LEGACY_ADMIN_ACTIVE_TENANT_COOKIE,
} from "@/lib/admin-tenant-cookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const rawSlug = typeof body?.slug === "string" ? body.slug : body?.tenantId;
  const slug = typeof rawSlug === "string" ? rawSlug.trim() : "";

  if (!slug) {
    return NextResponse.json({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const baseUrl = getApiBase().replace(/\/+$/, "");

  const { response: accessRes, body: accessBody } = await proxyBackend(`${baseUrl}/admin/access`, {
    method: "GET",
    headers: {
      ...buildHeaders(user, slug),
      "x-auth-context": "admin",
    },
    cache: "no-store",
  });

  if (accessRes.ok) {
    const blocked = Boolean((accessBody as any)?.blocked);
    const redirectTo = blocked ? "/admin/status-assinatura" : "/admin/dashboard";
    const res = NextResponse.json({ redirectTo, blocked, context: "admin" });
    res.cookies.set(ADMIN_ACTIVE_TENANT_COOKIE, slug, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.cookies.set(LEGACY_ADMIN_ACTIVE_TENANT_COOKIE, "", {
      path: "/",
      maxAge: 0,
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  }

  const { response: meRes, body: meBody } = await proxyBackend(`${baseUrl}/me`, {
    method: "GET",
    headers: {
      ...buildHeaders(user, slug),
      "x-auth-context": "athlete",
    },
    cache: "no-store",
  });

  if (!meRes.ok) {
    return NextResponse.json(
      typeof meBody === "string" ? { error: meBody } : (meBody ?? { error: "Falha" }),
      { status: meRes.status }
    );
  }

  const resolvedSlug = (meBody as any)?.tenant?.tenantSlug || slug;
  const redirectTo = `/${resolvedSlug}/perfil`;
  return NextResponse.json({ redirectTo, context: "athlete" });
}
