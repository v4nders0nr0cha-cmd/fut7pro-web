import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/options";
import { getApiBase } from "@/lib/get-api-base";

type BackendAuth = {
  headers: Record<string, string>;
  accessToken: string;
  tenantSlug: string | null;
};

export async function resolveBackendAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  explicitTenantSlug?: string | null
): Promise<BackendAuth> {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.accessToken) {
    throw new Error("UNAUTHENTICATED");
  }

  const tenantSlug =
    explicitTenantSlug ?? (session.user.tenantSlug !== undefined ? session.user.tenantSlug : null);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${session.user.accessToken}`,
  };

  if (tenantSlug) {
    headers["x-tenant-slug"] = tenantSlug;
  }

  return {
    headers,
    accessToken: session.user.accessToken,
    tenantSlug,
  };
}

export function backendUrl(path: string): string {
  const normalizedBase = getApiBase();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}
