import { getServerSession } from "next-auth/next";
import { cookies } from "next/headers";
import { authOptions } from "@/server/auth/admin-options";
import { getApiBase } from "@/lib/get-api-base";
import type { MeResponse } from "@/types/me";

const ACTIVE_TENANT_COOKIE = "fut7pro_active_tenant";

type AdminSessionUser = {
  accessToken?: string | null;
  tenantSlug?: string | null;
};

type AdminSession = { user?: AdminSessionUser } | null;

export async function fetchAdminMe(): Promise<MeResponse | null> {
  const session = (await getServerSession(authOptions as any)) as AdminSession;
  const user = session?.user;
  if (!user?.accessToken) {
    return null;
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${user.accessToken}`,
  };
  const cookieSlug = cookies().get(ACTIVE_TENANT_COOKIE)?.value;
  const resolvedSlug = cookieSlug || user.tenantSlug || null;
  if (resolvedSlug) {
    headers["x-tenant-slug"] = resolvedSlug;
  }
  headers["x-auth-context"] = "admin";

  const base = getApiBase().replace(/\/+$/, "");
  const response = await fetch(`${base}/me`, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as MeResponse;
  return data ?? null;
}

export function isPresidenteRole(role?: string | null) {
  return String(role || "").toUpperCase() === "PRESIDENTE";
}
