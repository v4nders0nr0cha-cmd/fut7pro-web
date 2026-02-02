import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/admin-options";
import { getApiBase } from "@/lib/get-api-base";
import type { MeResponse } from "@/types/me";

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
  if (user.tenantSlug) {
    headers["x-tenant-slug"] = user.tenantSlug;
  }

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
