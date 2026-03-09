import { NextRequest, NextResponse } from "next/server";
import { buildHeaders, proxyBackend, requireUser, resolveTenantSlug } from "../../_proxy/helpers";
import { getApiBase } from "@/lib/get-api-base";
import {
  ADMIN_ACTIVE_TENANT_COOKIE,
  LEGACY_ADMIN_ACTIVE_TENANT_COOKIE,
} from "@/lib/admin-tenant-cookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HubTenantItem = {
  tenantSlug?: string | null;
};

function normalizeHubItems(payload: unknown): HubTenantItem[] {
  if (Array.isArray(payload)) return payload as HubTenantItem[];
  if (payload && typeof payload === "object" && Array.isArray((payload as any).items)) {
    return (payload as { items: HubTenantItem[] }).items;
  }
  return [];
}

function parseBody(payload: unknown) {
  if (typeof payload !== "string") {
    return payload;
  }
  try {
    return payload ? JSON.parse(payload) : null;
  } catch {
    return { error: payload };
  }
}

async function resolveSingleTenantSlug(user: Awaited<ReturnType<typeof requireUser>>) {
  if (!user) return null;
  const baseUrl = getApiBase().replace(/\/+$/, "");
  const { response, body } = await proxyBackend(`${baseUrl}/admin/hub`, {
    method: "GET",
    headers: {
      ...buildHeaders(user),
      "x-auth-context": "admin",
    },
    cache: "no-store",
  });
  if (!response.ok) return null;

  const items = normalizeHubItems(body);
  if (items.length !== 1) return null;
  const slug = String(items[0]?.tenantSlug || "").trim();
  return slug || null;
}

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const slugParam = req.nextUrl.searchParams.get("slug") || undefined;
  const tenantSlug =
    resolveTenantSlug(user, slugParam) || (await resolveSingleTenantSlug(user)) || null;
  if (!tenantSlug) {
    return NextResponse.json({ error: "Tenant nao identificado" }, { status: 400 });
  }

  const baseUrl = getApiBase().replace(/\/+$/, "");
  const { response, body } = await proxyBackend(`${baseUrl}/admin/access`, {
    method: "GET",
    headers: {
      ...buildHeaders(user, tenantSlug),
      "x-auth-context": "admin",
    },
    cache: "no-store",
  });

  const payload = parseBody(body);
  const result = NextResponse.json(payload ?? {}, { status: response.status });

  if (response.ok) {
    const resolvedSlug = String((payload as any)?.tenant?.slug || tenantSlug).trim();
    if (resolvedSlug) {
      result.cookies.set(ADMIN_ACTIVE_TENANT_COOKIE, resolvedSlug, {
        path: "/",
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
      result.cookies.set(LEGACY_ADMIN_ACTIVE_TENANT_COOKIE, "", {
        path: "/",
        maxAge: 0,
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
    }
  }

  return result;
}
